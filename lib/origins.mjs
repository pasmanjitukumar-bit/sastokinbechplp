// Trust explicit configuration and Vercel-provided environment variables only.
// Never derive production trust from Host or X-Forwarded-Host request headers.
function originOf(value, production, header = false) {
  if (!value || typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      return null;
    if (url.protocol !== "https:" && (production || url.protocol !== "http:"))
      return null;
    if (header && value !== url.origin) return null;
    return url.origin;
  } catch {
    return null;
  }
}
export function allowedOrigins(env = process.env, requestUrl) {
  const production = env.NODE_ENV === "production" || env.VERCEL === "1";
  const origins = new Set();
  for (const value of [
    env.FRONTEND_URL,
    env.NEXT_PUBLIC_SITE_URL,
    env.ALLOWED_ORIGINS,
  ]) {
    for (const candidate of (value || "").split(/[\s,]+/)) {
      const origin = originOf(candidate, production);
      if (origin) origins.add(origin);
    }
  }
  if (env.VERCEL === "1") {
    for (const value of [
      env.VERCEL_PROJECT_PRODUCTION_URL,
      env.VERCEL_URL,
      env.VERCEL_BRANCH_URL,
    ]) {
      const origin = originOf(
        value?.startsWith("https://") ? value : value ? "https://" + value : "",
        true,
      );
      if (origin) origins.add(origin);
    }
  }
  if (!production && !origins.size && requestUrl) {
    try {
      const url = new URL(requestUrl);
      if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
        origins.add(url.origin);
    } catch {}
  }
  return origins;
}
export function isAllowedOrigin(origin, env = process.env, requestUrl) {
  const normalized = originOf(
    origin,
    env.NODE_ENV === "production" || env.VERCEL === "1",
    true,
  );
  return !!normalized && allowedOrigins(env, requestUrl).has(normalized);
}
