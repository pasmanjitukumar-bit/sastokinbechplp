# Sastokinbech COD funnel

Local Next.js App Router + React + Tailwind project. Google Sheets persistence and Nodemailer SMTP run only on the server. No online payment integration.

## Run locally

Use Node.js 22 or newer. From this directory:

```powershell
npm install
Copy-Item .env.example .env.local
# For a local simulation set ORDER_DEMO_MODE=true in .env.local
npm run dev
```

Open http://127.0.0.1:3015. The local installation is now configured for real integrations with demo mode disabled. Set ORDER_DEMO_MODE=true only when intentionally testing without Sheets or email. Demo writes to ignored .local-orders/*.json, never Sheets or SMTP; the page and receipt say so. Production always disables demo, even if the variable is true. Never put real customer details in a demo. Delete test records when finished.

## Product and design assumptions to confirm

Brand: Sastokinbech. Ivory, deep green, marigold palette. All Nepal only. Current images are sarees, so only sarees are offered for purchase; do not claim men’s or children’s products are available until adding inventory.

The three price pairs were assigned provisionally: Marigold Rs. 2,999 → 1,999; Emerald Rs. 3,999 → 2,999; Ivory Rs. 2,499 → 1,499. Product names and photo groupings are editorial drafts. Similar gold images may represent different items: confirm groupings and inventory before publishing. Edit lib/catalog.mjs to change them. Images are PNGs at source resolution, without invented detail or upscaling; small originals will remain less sharp. Originals are not modified.

Delivery is Rs. 100 inside Kathmandu Valley, Rs. 150 outside, once per order. Buyer chooses the zone; staff should verify it during confirmation. Quantity is 1–20. Product specification, material, size, blouse inclusion, shipping times, and returns have not been supplied; FAQ asks customers to confirm rather than inventing promises. The former sample testimonials have been removed. The page now explains the three-step shopping process in English. Add testimonials only after obtaining actual customer feedback and permission to publish associated names and photos. No reels section is rendered.

## Order flow

1. Landing page sends product ID, quantity, and zone to /checkout via query parameters.
2. Checkout displays catalog name/prices and posts customer fields plus product ID, quantity and zone as JSON to /api/order. A UUID v4 Idempotency-Key is retained across retries in that checkout.
3. Server checks origin, body size, rate, phone/email/address, product and quantity. Nepal mobile numbers (96/97/98 prefixes) with optional +977 are supported. Server ignores any client-submitted prices and calculates totals from its catalog.
4. Save order to Sheets using RAW values (prevents spreadsheet formula injection), then send business and customer HTML emails. Email completion flags are persisted in hidden technical columns.
5. Return success only after both SMTP sends are accepted, and show /thank-you using a minimal receipt in sessionStorage. The receipt is not an authentication or order lookup mechanism.
6. On failure checkout shows an error without redirecting. Retry the same submission to resume a saved order and skip already acknowledged emails. Do not refresh a partially completed checkout; contact the store with the displayed order ID if needed.

## Google Sheets setup

1. Create a Google Cloud project and enable **Google Sheets API**. Create a service account and download its JSON key. Keep the file private.
2. Create a new spreadsheet and a tab named Orders (or set GOOGLE_SHEET_TAB_NAME to your exact tab name).
3. Sheet ID is the value between /d/ and /edit in the Google Sheets URL. Put it in GOOGLE_SHEET_ID.
4. Share the spreadsheet as Editor with the client_email in the service account JSON.
5. Put client_email into GOOGLE_SERVICE_ACCOUNT_EMAIL and private_key into GOOGLE_PRIVATE_KEY. In .env.local use a quoted key with literal \n separators. Never prefix credentials with NEXT_PUBLIC_.
6. With these variables configured, run the following explicit setup command on an empty tab:

```powershell
node --env-file=.env.local scripts/setup-sheet.mjs
```

The setup creates the named tab if missing and refuses to replace an incompatible existing header. It writes the header, applies a green header and alternating white/sage rows, freezes the header and first column, adds filters, sets readable row heights and column widths, displays rupee amounts, hides technical columns N:P, and adds colour-coded Order Status dropdowns. It does not clear order rows.

Columns A:M are: Order ID, Date & Time, Customer Name, Phone Number, Email Address, Exact Location, Product Name, Quantity, Price Per Piece, Total Price, Payment Method, Order Status, Notes.

Columns N:R are required for reliable retries and accounting: Request Fingerprint, Business Email Sent, Customer Email Sent, Delivery Fee, Delivery Zone. Do not delete or rename them. Date & Time is stored in ISO UTC; emails display Asia/Kathmandu time. Total includes delivery.

Manual alternative: paste the headers from lib/repository.mjs into A1:R1. Select A:R → Data → Create a filter. Freeze row 1 and style the header. Select L2:L → Data → Data validation → Dropdown: New Order, Order Confirmed, Order Ongoing, Delivered, Cancelled. Hide N:P. The API checks exact headers before writing.

## Email setup

BUSINESS_EMAIL receives the store notification (pasmanjitukumar@gmail.com). EMAIL_FROM is the authenticated sender; EMAIL_REPLY_TO is optional and defaults to EMAIL_FROM. BRAND_NAME controls email branding. Set SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER to your Gmail, SMTP_PASS to a Gmail app password. Google generally requires 2-Step Verification for app passwords; some account policies disallow them. Never use your normal Gmail password. Port 587 with STARTTLS is also supported for another provider.

EMAIL_SERVICE_API_KEY is included as requested but unused: this implementation chooses SMTP, not an API email provider. Both emails have inline CSS/table layouts plus a text fallback and escaped customer values. SMTP acceptance is not guaranteed inbox delivery; check spam and sender authentication. Business and customer addresses are never used from untrusted request data except the validated customer recipient.

## Environment variables

Copy .env.example. NEXT_PUBLIC_SITE_URL is the public canonical URL. FRONTEND_URL must exactly match the browser origin (scheme, host and port); localhost and 127.0.0.1 are different. All Google/SMTP/business variables stay server-side. Set ORDER_DEMO_MODE=false for actual local integration testing and restart the server after edits. Missing production credentials return 503 rather than a fake success.

## Test

```powershell
npm test
npm run build
```

Unit tests cover server-owned totals, bad input, sheet failure, partial-email recovery, repeated submissions, changed payloads and HTML escaping. For the UI, select each product, change quantity and delivery zone, submit a demo checkout and inspect the clearly marked receipt and local JSON file. Test mobile layout and keyboard navigation.

Live integration acceptance: switch demo off, configure variables, run sheet setup, restart dev; submit an order with an inbox you own. Verify exactly one Sheet row with a unique order ID, quantity and total; both inboxes receive correctly formatted emails; O/P show Yes; thank-you shows correct receipt. Repeat the same request/key to verify no extra row/emails in a single instance. Test wrong credentials and ensure no redirect. When SMTP fails after save, fix credentials and retry the same key to resume. Live delivery cannot be verified without your credentials.

## Vercel deployment later

Import this GitHub repository as the Vercel project. Leave Root Directory at the repository root (.). Framework: Next.js. Build: npm run build. No static export: /api/order needs Node.js. Add all values from .env.example to Vercel Project Settings → Environment Variables. Set FRONTEND_URL and NEXT_PUBLIC_SITE_URL to the exact HTTPS domain; leave ORDER_DEMO_MODE=false. Paste the private key with literal \n separators. Configure separate preview env URLs if testing a preview domain. Redeploy after changing env variables and run live acceptance on the final domain. No deployment was made for this local request.

## Operational limits before scaling

Sheets and SMTP are separate systems: they cannot form an atomic transaction. Persisted flags handle ordinary sequential retries, but an SMTP acceptance followed by a flag-write failure can resend an email. A process crash or simultaneous requests on different Vercel instances can race between Sheets lookup and append. In-memory locks and rate limits only protect one process. Do not claim exactly-once behavior or distributed abuse protection. For high volume or strict duplicate guarantees, add a transactional database with a unique request key, distributed rate limits, and a durable outbox/worker before launch. Never sort only part of a Sheet row; keep technical cells attached to their order. Large sheets require a database/index instead of scanning IDs.

No credentials are committed, no external writes happen in demo, and errors do not log customer payloads. Add deployment-level bot controls as needed. Confirm stock, prices, delivery coverage, product image rights, return policy, and real testimonials before publishing.

Official references: [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [Google Sheets values](https://developers.google.com/workspace/sheets/api/guides/values), [Nodemailer Gmail guide](https://nodemailer.com/usage/using-gmail/), [Google app passwords](https://support.google.com/mail/answer/185833).


## This Windows installation

Gmail uses port 587 with mandatory STARTTLS. The local dev launcher exports this computer’s trusted Windows root/intermediate certificates to a temporary public certificate bundle and supplies NODE_EXTRA_CA_CERTS before starting Node. This supports installed antivirus TLS inspection while keeping certificate validation enabled. It does not copy private keys or passwords. Production Vercel uses normal platform trust; the launcher is only for npm run dev.

Local Google credentials are stored only in ignored .env.local. Google Sheets must be shared with the configured service-account email as Editor. SMTP test acceptance confirms Gmail accepted the messages; check the mailbox and spam folder for actual receipt.

## Order API origin configuration

Checkout uses relative /api/order, so orders always go to the current website. The API accepts exact origins from FRONTEND_URL, NEXT_PUBLIC_SITE_URL and comma-separated ALLOWED_ORIGINS. Neither frontend variable overrides the other. In Vercel it also accepts the platform-provided VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL and VERCEL_BRANCH_URL, using HTTPS. Enable Vercel system environment variables if your project disables them.

For a custom domain set FRONTEND_URL and NEXT_PUBLIC_SITE_URL to the canonical HTTPS origin. List both https://your-domain.com and https://www.your-domain.com in ALLOWED_ORIGINS if both serve the storefront. Do not use wildcards, localhost in production, or paths/query strings. HTTP is rejected in production; missing/null and unlisted Origin headers are rejected. Incoming Host and X-Forwarded-Host cannot expand the allowlist. The owner-approved HTTPS origins https://sastokinbech.com, https://www.sastokinbech.com and https://sastokinbechplp.vercel.app are explicitly listed in lib/origins.mjs. All other production origins require explicit environment or Vercel configuration. Redeploy after environment changes.

After deployment, test an invalid order from the live origin (400 validation error, rather than 403), verify an unlisted origin still gets 403, then submit a clearly labelled test order and check its Sheet row plus both email flags. A successful API response alone does not prove inbox delivery.
