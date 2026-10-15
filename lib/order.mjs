import { z } from "zod";
import { createHash } from "node:crypto";
import { getProduct, delivery } from "./catalog.mjs";
export const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/[ -]/g, ""))
    .refine(
      (s) => /^(?:\+977)?9[678]\d{8}$/.test(s),
      "Enter a valid Nepal mobile number.",
    ),
  email: z.email("Please enter a valid email address.").max(254),
  location: z
    .string()
    .trim()
    .min(8, "Please provide your exact location (at least 8 characters).")
    .max(500),
  productId: z
    .string()
    .refine((id) => !!getProduct(id), "Please select a valid product."),
  quantity: z.number().int().min(1).max(20),
  zone: z.enum(["valley", "outside"]),
  website: z.string().max(0).optional(),
});
export function prepare(input, key) {
  const d = schema.parse(input),
    p = getProduct(d.productId);
  const fingerprint = createHash("sha256")
    .update(JSON.stringify(d))
    .digest("hex");
  return {
    ...d,
    id: "SKB-" + key,
    date: new Date().toISOString(),
    productName: p.name,
    price: p.price,
    delivery: delivery(d.zone),
    total: p.price * d.quantity + delivery(d.zone),
    paymentMethod: "Cash On Delivery",
    status: "New Order",
    fingerprint,
    businessSent: false,
    customerSent: false,
  };
}
export async function processOrder(order, repo, send) {
  let saved = await repo.find(order.id);
  if (saved && saved.fingerprint !== order.fingerprint) {
    const e = new Error(
      "This checkout has changed. Refresh the page before placing a new order.",
    );
    e.status = 409;
    throw e;
  }
  if (!saved) {
    await repo.save(order);
    saved = order;
  }
  for (const kind of ["business", "customer"]) {
    const field = kind + "Sent";
    if (!saved[field]) {
      try {
        await send(kind, saved);
        saved[field] = true;
        await repo.mark(saved, field);
      } catch {
        const err = new Error(
          "Your order was saved, but an email notification could not be completed. Please retry this submission; your order ID is " +
            saved.id +
            ".",
        );
        err.status = 502;
        throw err;
      }
    }
  }
  return saved;
}
export function publicOrder(o, demo = false) {
  return {
    id: o.id,
    date: o.date,
    productName: o.productName,
    quantity: o.quantity,
    price: o.price,
    delivery: o.delivery,
    total: o.total,
    paymentMethod: o.paymentMethod,
    demo,
  };
}
