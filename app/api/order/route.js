import { isAllowedOrigin } from "../../../lib/origins.mjs";
import { NextResponse } from "next/server";
import { prepare, processOrder, publicOrder } from "../../../lib/order.mjs";
import { localRepository, sheetsRepository } from "../../../lib/repository.mjs";
import { createMailer } from "../../../lib/email.mjs";
export const runtime = "nodejs";
export const maxDuration = 60;
const locks = new Map(),
  limits = new Map();
export async function POST(request) {
  let key;
  try {
    if (
      !isAllowedOrigin(request.headers.get("origin"), process.env, request.url)
    )
      return NextResponse.json(
        { error: "Request origin is not allowed." },
        { status: 403 },
      );
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    const now = Date.now();
    for (const [k, v] of limits) if (v.until < now) limits.delete(k);
    const rate = limits.get(ip) || { count: 0, until: now + 60000 };
    if (++rate.count > 10)
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 },
      );
    limits.set(ip, rate);
    if (Number(request.headers.get("content-length")) > 12000)
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    key = request.headers.get("idempotency-key");
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        key || "",
      )
    )
      return NextResponse.json(
        { error: "Invalid checkout request. Please refresh and retry." },
        { status: 400 },
      );
    const text = await request.text();
    if (text.length > 12000)
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    let input;
    try {
      input = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }
    const order = prepare(input, key);
    const demo =
      process.env.NODE_ENV !== "production" &&
      process.env.ORDER_DEMO_MODE === "true";
    if (!demo) {
      const required = [
        "BUSINESS_EMAIL",
        "EMAIL_FROM",
        "GOOGLE_SHEET_ID",
        "GOOGLE_SHEET_TAB_NAME",
        "GOOGLE_SERVICE_ACCOUNT_EMAIL",
        "GOOGLE_PRIVATE_KEY",
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASS",
      ];
      if (required.some((k) => !process.env[k]))
        return NextResponse.json(
          {
            error:
              "Ordering is not configured yet. Please contact the store by email.",
          },
          { status: 503 },
        );
    }
    if (locks.has(key))
      return NextResponse.json(
        {
          error:
            "This order is already being processed. Please wait and retry.",
        },
        { status: 409 },
      );
    locks.set(key, true);
    try {
      const repo = demo ? localRepository() : await sheetsRepository();
      const saved = await processOrder(
        order,
        repo,
        demo ? async () => {} : createMailer(),
      );
      return NextResponse.json(
        { success: true, order: publicOrder(saved, demo) },
        { headers: { "Cache-Control": "no-store" } },
      );
    } finally {
      locks.delete(key);
    }
  } catch (e) {
    if (e.name === "ZodError")
      return NextResponse.json(
        { error: e.issues.map((x) => x.message).join(" ") },
        { status: 400 },
      );
    console.error("Order processing error", {
      type: e.name,
      status: e.status || 500,
    });
    return NextResponse.json(
      {
        error: e.status
          ? e.message
          : "Unable to complete your order. Please retry the same submission or contact the store.",
      },
      { status: e.status || 502 },
    );
  }
}
