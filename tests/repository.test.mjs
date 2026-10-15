import test from "node:test";
import assert from "node:assert/strict";
import { GoogleAuth } from "google-auth-library";
import { sheetsRepository, headers } from "../lib/repository.mjs";
test("Sheets reads unformatted numbers so currency styling cannot corrupt order totals", async (t) => {
  process.env.GOOGLE_PRIVATE_KEY = "test";
  process.env.GOOGLE_SHEET_ID = "test";
  process.env.GOOGLE_SHEET_TAB_NAME = "Orders";
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "test@example.com";
  let count = 0;
  t.mock.method(GoogleAuth.prototype, "getClient", async () => ({
    request: async (options) => {
      assert.ok(options.url.includes("valueRenderOption=UNFORMATTED_VALUE"));
      count++;
      return {
        data: {
          values:
            count === 1
              ? [headers]
              : [
                  [
                    "SKB-test",
                    "2026-10-15T00:00:00Z",
                    "Test",
                    "9800000000",
                    "test@example.com",
                    "Test location",
                    "Saree",
                    1,
                    1999,
                    2099,
                    "Cash On Delivery",
                    "New Order",
                    "",
                    "fingerprint",
                    "Yes",
                    "Yes",
                    100,
                    "valley",
                  ],
                ],
        },
      };
    },
  }));
  const repo = await sheetsRepository();
  const order = await repo.find("SKB-test");
  assert.equal(order.price, 1999);
  assert.equal(order.total, 2099);
  assert.equal(order.delivery, 100);
  assert.ok(order.businessSent && order.customerSent);
});
