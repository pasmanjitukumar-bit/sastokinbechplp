"use client";
import { useState, useEffect } from "react";
import { money } from "../../lib/catalog.mjs";
export default function Page() {
  const [o, setO] = useState(null);
  useEffect(() => {
    try {
      setO(JSON.parse(sessionStorage.getItem("last-order")));
    } catch {}
  }, []);
  return (
    <main className="section thanks">
      <div className="success">✓</div>
      <p className="eyebrow">
        {o?.demo ? "LOCAL DEMO COMPLETE" : "A LITTLE JOY IS ON ITS WAY"}
      </p>
      <h1>
        Thank you
        <br />
        <em>for your order!</em>
      </h1>
      {o ? (
        <>
          <p>
            {o.demo
              ? "Demo order saved locally. No emails were sent or Google Sheet updated."
              : "Our sales representative will call you soon to confirm your order."}
          </p>
          <div className="receipt">
            <small>{o.id}</small>
            <h3>{o.productName}</h3>
            <p>Quantity: {o.quantity}</p>
            <p>
              Total price: <b>{money(o.total)}</b>
            </p>
            <p>Payment method: Cash On Delivery</p>
          </div>
        </>
      ) : (
        <p>Your receipt will appear here after successful checkout.</p>
      )}
      <a className="button" href="/">
        Back to Home ↗
      </a>
    </main>
  );
}
