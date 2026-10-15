import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedOrigin, allowedOrigins } from "../lib/origins.mjs";
const env = {
  NODE_ENV: "production",
  FRONTEND_URL: "https://shop.example.com/",
  NEXT_PUBLIC_SITE_URL: "https://example.com",
  ALLOWED_ORIGINS: "https://www.example.com, https://other.example.com",
};
test("configured origins are combined, canonicalized, and matched exactly", () => {
  for (const o of [
    "https://shop.example.com",
    "https://example.com",
    "https://www.example.com",
    "https://other.example.com",
  ])
    assert.ok(isAllowedOrigin(o, env));
  for (const o of [
    "http://example.com",
    "https://example.com.attacker.test",
    "https://unlisted.example.com",
    "https://example.com:444",
    null,
    "null",
    "*",
    "https://example.com/path",
    "https://user@example.com",
    "https://example.com/",
  ])
    assert.equal(isAllowedOrigin(o, env), false);
});
test("production ignores localhost config and request-host fallback", () => {
  assert.equal(
    allowedOrigins(
      { NODE_ENV: "production", FRONTEND_URL: "http://127.0.0.1:3015" },
      "https://evil.test/api/order",
    ).has("http://127.0.0.1:3015"),
    false,
  );
  assert.equal(
    isAllowedOrigin(
      "https://evil.test",
      { NODE_ENV: "production" },
      "https://evil.test/api/order",
    ),
    false,
  );
});
test("Vercel exact production, branch and deployment URLs work despite stale frontend config", () => {
  const e = {
    NODE_ENV: "production",
    VERCEL: "1",
    FRONTEND_URL: "http://localhost:3015",
    VERCEL_PROJECT_PRODUCTION_URL: "my-shop.example.com",
    VERCEL_URL: "shop-abc.vercel.app",
    VERCEL_BRANCH_URL: "shop-git-main.vercel.app",
  };
  for (const host of [
    "my-shop.example.com",
    "shop-abc.vercel.app",
    "shop-git-main.vercel.app",
  ])
    assert.ok(isAllowedOrigin("https://" + host, e));
  assert.equal(isAllowedOrigin("https://random.vercel.app", e), false);
});
test("local origin fallback is restricted to development loopback", () => {
  assert.ok(
    isAllowedOrigin(
      "http://127.0.0.1:3015",
      {},
      "http://127.0.0.1:3015/api/order",
    ),
  );
  assert.equal(
    isAllowedOrigin("https://evil.test", {}, "https://evil.test/api/order"),
    false,
  );
  assert.equal(
    isAllowedOrigin("https://shop-abc.vercel.app", {
      NODE_ENV: "production",
      VERCEL_URL: "shop-abc.vercel.app",
    }),
    false,
  );
});

test("owner-approved HTTPS custom and Vercel domains are allowed without stale dashboard settings", () => {
  for (const origin of [
    "https://sastokinbech.com",
    "https://www.sastokinbech.com",
    "https://sastokinbechplp.vercel.app",
  ])
    assert.ok(isAllowedOrigin(origin, { NODE_ENV: "production" }));
  for (const origin of [
    "http://sastokinbech.com",
    "https://sastokinbech.com.attacker.test",
    "https://other.sastokinbech.com",
  ])
    assert.equal(isAllowedOrigin(origin, { NODE_ENV: "production" }), false);
});

test("product storefront allows only its exact HTTPS origin", () => {
  assert.ok(
    isAllowedOrigin("https://product.sastokinbech.com", {
      NODE_ENV: "production",
    }),
  );
  assert.equal(
    isAllowedOrigin("http://product.sastokinbech.com", {
      NODE_ENV: "production",
    }),
    false,
  );
  assert.equal(
    isAllowedOrigin("https://product.sastokinbech.com.attacker.test", {
      NODE_ENV: "production",
    }),
    false,
  );
});
