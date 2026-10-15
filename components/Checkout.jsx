"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { getProduct, products, money, delivery } from "../lib/catalog.mjs";
export default function Checkout() {
  const params = useSearchParams(),
    router = useRouter(),
    p = getProduct(params.get("product")) || products[0],
    q = Number(params.get("quantity") || 1),
    quantity = Number.isInteger(q) && q >= 1 && q <= 20 ? q : 1;
  const [zone, setZone] = useState(
      params.get("zone") === "outside" ? "outside" : "valley",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = useRef(null),
    lock = useRef(false);
  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    key.current ||= crypto.randomUUID();
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": key.current,
        },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(e.currentTarget)),
          productId: p.id,
          quantity,
          zone,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Unable to submit order. Please retry.");
      sessionStorage.setItem("last-order", JSON.stringify(data.order));
      router.push("/thank-you");
    } catch (err) {
      setError(err.message);
      setBusy(false);
      lock.current = false;
    }
  }
  return (
    <main className="section checkout">
      <a className="text-link" href="/#collection">
        ← Back to collection
      </a>
      <p className="eyebrow">YOUR NEXT FAVOURITE, ALMOST YOURS</p>
      <h1>
        Make it <em>yours.</em>
      </h1>
      <p>Cash on Delivery. No online payment required.</p>
      <div className="checkout-grid">
        <form onSubmit={submit}>
          <h3>Where should we send it?</h3>
          <label>
            Full Name
            <input
              name="name"
              required
              maxLength={100}
              autoComplete="name"
              placeholder="Your full name"
            />
          </label>
          <label>
            Phone Number
            <input
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              placeholder="98XXXXXXXX"
            />
          </label>
          <label>
            Email Address
            <input
              name="email"
              required
              type="email"
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Exact Location
            <textarea
              name="location"
              required
              minLength={8}
              maxLength={500}
              autoComplete="street-address"
              placeholder="Kindly share your exact location"
            />
          </label>
          <label>
            Delivery region
            <select
              value={zone}
              onChange={(e) => {
                setZone(e.target.value);
                key.current = null;
              }}
            >
              <option value="valley">Inside Kathmandu Valley — Rs. 100</option>
              <option value="outside">
                Outside Kathmandu Valley — Rs. 150
              </option>
            </select>
          </label>
          <label className="honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <p className="fine">
            We use your contact information to process your order and arrange
            delivery within Nepal.
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="button full">
            {busy ? "Submitting Order..." : "Order Now"} <span>↗</span>
          </button>
        </form>
        <aside className="order-summary">
          <p className="eyebrow">YOUR ORDER</p>
          <img src={"/products/" + p.images[0] + ".png"} alt={p.name} />
          <h3>{p.name}</h3>
          <dl>
            <div>
              <dt>Quantity</dt>
              <dd>{quantity}</dd>
            </div>
            <div>
              <dt>Price per piece</dt>
              <dd>{money(p.price)}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(p.price * quantity)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{money(delivery(zone))}</dd>
            </div>
            <div className="total">
              <dt>Total</dt>
              <dd>{money(p.price * quantity + delivery(zone))}</dd>
            </div>
          </dl>
          <p>◈ Cash on Delivery</p>
          <p className="fine">
            Our sales representative will call you soon to confirm your order.
          </p>
        </aside>
      </div>
    </main>
  );
}
