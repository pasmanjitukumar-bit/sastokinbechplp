import nodemailer from "nodemailer";
import { money } from "./catalog.mjs";
export const escapeHtml = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function emailContent(kind, o) {
  const business = kind === "business",
    brand = process.env.BRAND_NAME || "Sastokinbech",
    reply = process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM;
  const rows = [
    ["Order ID", o.id],
    [
      "Date & Time",
      new Date(o.date).toLocaleString("en-GB", { timeZone: "Asia/Kathmandu" }),
    ],
    ...(business
      ? [
          ["Customer Name", o.name],
          ["Phone Number", o.phone],
          ["Email Address", o.email],
          ["Exact Location", o.location],
        ]
      : []),
    ["Product", o.productName],
    ["Quantity", o.quantity],
    ["Price per piece", money(o.price)],
    ["Delivery", money(o.delivery)],
    ["Total price", money(o.total)],
    ["Payment Method", "Cash On Delivery"],
    ["Order Status", "New Order"],
  ];
  const headline = business
    ? "New order received"
    : "Thank you for your order!";
  const message = business
    ? "Please call the customer soon to confirm this order."
    : "Our sales representative will call you soon to confirm your order.";
  const table = rows
    .map(
      ([k, v]) =>
        '<tr><td style="padding:12px 0;border-bottom:1px solid #e0e4d8;color:#687567;width:42%">' +
        escapeHtml(k) +
        '</td><td style="padding:12px 0;border-bottom:1px solid #e0e4d8">' +
        escapeHtml(v) +
        "</td></tr>",
    )
    .join("");
  return {
    subject: business
      ? "New Product Order Received - " + o.id
      : "Your Order Has Been Received - " + brand,
    text:
      headline +
      "\nHi " +
      o.name +
      "\n" +
      rows.map(([k, v]) => k + ": " + v).join("\n") +
      "\n" +
      message +
      "\nSupport: " +
      reply,
    html:
      '<!doctype html><html><body style="margin:0;background:#f5f3ec;font-family:Arial,sans-serif;color:#183e36"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" style="max-width:600px;background:#ffffff" cellpadding="0" cellspacing="0"><tr><td style="padding:28px;background:#183e36;color:#fff;font-family:Georgia,serif;font-size:28px">' +
      escapeHtml(brand) +
      '</td></tr><tr><td style="padding:30px"><p style="color:#8c633b;font-size:11px;letter-spacing:2px">ORDER RECEIVED</p><h1 style="font-family:Georgia,serif;font-size:30px;font-weight:normal">' +
      headline +
      "</h1><p>Hi " +
      escapeHtml(business ? brand + " team" : o.name) +
      ',</p><p>We have received your order successfully.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px">' +
      table +
      '</table><p style="padding:20px;background:#eef0e6;line-height:1.6">' +
      message +
      '</p><p style="font-size:13px">Questions? Reply to ' +
      escapeHtml(reply) +
      ".</p><p>Thank you,<br/>" +
      escapeHtml(brand) +
      "</p></td></tr></table></td></tr></table></body></html>",
  };
}
export function createMailer() {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    requireTLS: Number(process.env.SMTP_PORT) !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    socketTimeout: 20000,
  });
  return async (kind, o) => {
    const to = kind === "business" ? process.env.BUSINESS_EMAIL : o.email;
    const result = await transport.sendMail({
      from: {
        name: process.env.BRAND_NAME || "Sastokinbech",
        address: process.env.EMAIL_FROM,
      },
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM,
      to,
      messageId:
        "<" +
        o.id +
        "." +
        kind +
        "@" +
        process.env.EMAIL_FROM.split("@")[1] +
        ">",
      ...emailContent(kind, o),
    });
    if (!result.accepted?.length || result.rejected?.length)
      throw new Error("Email rejected");
  };
}
