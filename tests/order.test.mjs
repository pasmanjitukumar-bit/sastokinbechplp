import test from "node:test";
import assert from "node:assert/strict";
import { prepare, processOrder } from "../lib/order.mjs";
import { escapeHtml, emailContent } from "../lib/email.mjs";
import { row, headers } from "../lib/repository.mjs";
const input = {
  name: "Anita Sharma",
  phone: "9800000000",
  email: "anita@example.com",
  location: "Kathmandu ward 10, Nepal",
  productId: "marigold",
  quantity: 2,
  zone: "outside",
};
const key = "12345678-1234-4234-8234-123456789abc";
test("server ignores tampered prices and computes delivery", () => {
  const o = prepare({ ...input, price: 1, total: 1 }, key);
  assert.equal(o.price, 1999);
  assert.equal(o.total, 4148);
  assert.equal(row(o).length, headers.length);
});
test("invalid quantity, phone, product and address rejected", () => {
  for (const change of [
    { quantity: 0 },
    { quantity: 1.2 },
    { quantity: 21 },
    { phone: "123" },
    { email: "bad" },
    { location: "x" },
    { productId: "fake" },
    { zone: "foreign" },
  ])
    assert.throws(() => prepare({ ...input, ...change }, key));
});
test("retry resumes failed email without duplicate sheet rows or business email", async () => {
  let saved = null,
    writes = 0,
    business = 0,
    customer = 0,
    fail = true;
  const repo = {
    find: async () => saved,
    save: async (o) => {
      writes++;
      saved = { ...o };
    },
    mark: async (o) => {
      saved = { ...o };
    },
  };
  const send = async (kind) => {
    if (kind === "business") business++;
    else {
      customer++;
      if (fail) throw Error("fail");
    }
  };
  const o = prepare(input, key);
  await assert.rejects(processOrder(o, repo, send), /order was saved/);
  fail = false;
  await processOrder(o, repo, send);
  await processOrder(o, repo, send);
  assert.equal(writes, 1);
  assert.equal(business, 1);
  assert.equal(customer, 2);
  await assert.rejects(
    processOrder(prepare({ ...input, quantity: 3 }, key), repo, send),
    /checkout has changed/,
  );
});
test("sheet failure prevents all email sends", async () => {
  let emails = 0;
  await assert.rejects(
    processOrder(
      prepare(input, key),
      {
        find: async () => null,
        save: async () => {
          throw Error("offline");
        },
      },
      async () => emails++,
    ),
  );
  assert.equal(emails, 0);
});
test("email escapes customer input and includes confirmation", () => {
  process.env.EMAIL_FROM = "store@example.com";
  assert.equal(escapeHtml("<script>"), "&lt;script&gt;");
  const html = emailContent("business", {
    ...prepare(input, key),
    name: "<img src=x>",
  }).html;
  assert.ok(html.includes("&lt;img"));
  assert.ok(!html.includes("<img src=x>"));
  assert.ok(
    emailContent("customer", prepare(input, key)).html.includes(
      "Our sales representative",
    ),
  );
});
