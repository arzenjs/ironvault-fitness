# IronVault Fitness

A JavaScript Next.js App Router portfolio demo: industrial editorial marketing pages, customer accounts, Razorpay test purchases, staff visibility and audited admin operations. IronVault is fictional. It supplies no real fitness services.

## Verification status â€” read first

This project was generated without a working execution environment. **Dependency installation, Python generator execution, image downloads, lint, production build, browser tests, database transactions and external provider integration have NOT been run.** This is source for local validation, not a production-certified or acceptance-complete delivery. Do not enable real-money payments. Inspect generated source before running setup.

## Prerequisites and start

Python 3.10+ generates the source; Node.js 22+ and npm run it. MongoDB Atlas or a local replica set is required for write transactions. A standalone MongoDB server is not supported.

1. Save the delivered text file as `bootstrap-ironvault.py`.
2. Run `python3 bootstrap-ironvault.py`. It refuses to overwrite an existing project.
3. Run `cd ironvault-fitness`.
4. Run `npm run setup` to resolve stable compatible packages and install them.
5. Run `npm run assets`, then visually review every downloaded photograph.
6. Copy `.env.example` to `.env.local` and configure local secrets.
7. Run `npm test`, `npm run lint`, `npm run build`, then `npm run dev`.

The setup script retrieves stable npm metadata at execution time, picks the highest stable Next.js/React versions permitted by stable next-auth peer requirements, pins versions and installs with strict peer checking. Auth.js v4 is used through `next-auth`: v5 beta is deliberately not installed. If the stable API moves to v5, setup stops for review rather than mixing incompatible APIs. Other packages resolve their stable latest versions. Strict installation can reject a newly published incompatible major; inspect and adjust only after reviewing its documentation. Commit package-lock.json after validation. Subsequent installs use `npm ci`, not setup.

## Structure

`src/config` holds business details, plans, navigation and copy. `src/models/index.js` contains small Mongoose schemas in one readable file. `src/services` owns payment activation, calendar dates and invitations. `src/lib` holds authentication, provider setup, email, database connection and validation. Public pages are Server Components, with Client Components for forms, checkout, animations, gallery and dialogs. Scripts bootstrap the admin, download local assets and reconcile purchases.

## Environment

| Variable | Use |
|---|---|
| MONGODB_URI | MongoDB Atlas or replica-set connection string |
| AUTH_SECRET | Strong random Auth.js session secret; generate with `openssl rand -base64 48` |
| AUTH_URL | Exact app origin, localhost in development and HTTPS in staging |
| RAZORPAY_KEY_ID | Test key beginning `rzp_test_`; live keys are rejected |
| RAZORPAY_KEY_SECRET | Server order creation, fetch and checkout signature secret |
| RAZORPAY_WEBHOOK_SECRET | Separate webhook HMAC secret |
| RESEND_API_KEY | Server-side email API key |
| RESEND_FROM_EMAIL | Approved sender; use verified domain for broader delivery |
| CONTACT_TO_EMAIL | Actual deployment operatorâ€™s enquiry destination, not the fictional address |
| ADMIN_EMAIL | Initial admin bootstrap only |
| ADMIN_NAME | Initial admin bootstrap only |
| ADMIN_PASSWORD | Initial admin bootstrap only; remove after bootstrap |

Auth.js v4 reads NEXTAUTH_URL internally; `lib/auth.js` sets it from AUTH_URL. AUTH_SECRET is passed explicitly. Do not duplicate differently configured origins. No payment secret is public. Checkout receives only the public Razorpay key and order data. Do not commit `.env.local`; do not send secrets in chat.

## MongoDB and initial admin

Use Atlas or start a local replica set and initiate it before running write workflows. Set indexes before accepting requests: the admin script invokes every modelâ€™s `init()`. Unique indexes protect emails, provider order IDs, captured payment IDs, membership payment IDs, invitation hashes, event IDs and email keys. TTL indexes clean rate-limit buckets; invitation expiry is checked explicitly, not delegated to TTL.

Set the three ADMIN variables locally. Run `npm run admin` once. It refuses if an admin already exists or the email belongs to another account. Remove the bootstrap password afterward. There is no public admin-creation route or public staff-registration route.

Customer registration uses bcrypt at cost 12 and rejects passwords over 72 UTF-8 bytes. Auth.js uses JWT sessions. Every protected request looks up the current database account again, enforcing enabled state and current role. Deactivating staff therefore invalidates access even if a session cookie remains. Password reset, email verification, MFA and session management UI are not implemented; add them before real production use.

## Payment lifecycle â€” actual implementation

1. Choose a plan. `/checkout?plan=quarterly` preserves the stable ID through login or registration.
2. The authenticated customer calls the order endpoint. The server ignores browser amounts and loads `src/config/membership-plans.js`.
3. A MongoDB transaction creates one pending Payment and its pending Membership. No access dates are assigned.
4. Outside that transaction, Razorpay creates a test order. The receipt equals the MongoDB Payment ID. The returned order ID is persisted.
5. Hosted Razorpay Checkout handles payment details. This application does not handle card fields.
6. Checkoutâ€™s callback is sent to the server. HMAC-SHA256 validates `stored_order_id|payment_id` using the key secret and a timing-safe comparison.
7. The signature alone does NOT grant access. The server fetches the Razorpay order and payment. Only a captured payment with matching order ID, amount and INR currency qualifies. The order receipt must also match the purchase ID.
8. A signed raw-body webhook independently calls the same reconciliation function. Provider state is fetched again; webhook entity fields do not directly activate access.
9. Inside a MongoDB transaction, the userâ€™s schedule version is incremented, the latest paid period is read, the pending Membership receives start/end timestamps, the Payment becomes successful and an email outbox record is written.
10. Email delivery runs after commit. Email failure never reverses a captured payment or membership. A failed delivery remains pending for retry.
11. The customer sees pending, successful, failed or abandoned provider-derived state in the account. A Check payment button repeats safe reconciliation.

Pending also covers authorized-but-not-captured and delayed confirmation. Failed represents an order with only failed attempts; a later captured retry can still move it to successful. Abandoned is inferred after 24 hours with no authorized/captured payment, not from closing checkout. Neither failure nor abandonment prevents a later genuine capture from being recognized. Checkout dismissal does not change stored state.

## Razorpay test setup and webhooks

Create test credentials in the Razorpay dashboard. Set test key ID and secret locally. Configure automatic capture appropriately in the provider dashboard: authorized payments intentionally remain pending until captured.

Deploy a staging HTTPS instance or use a provider-permitted public tunnel. Configure the webhook URL as `https://YOUR-STAGING-HOST/api/webhooks/razorpay`. Select `payment.captured`, `payment.failed`, `payment.authorized` and `order.paid`. Use a distinct webhook secret and set the same value in server configuration. Localhost cannot receive webhooks directly. Current official documentation notes several common testing/tunnel domains are blocked; use staging or check current provider guidance rather than assuming ngrok works.

Webhook verification hashes the EXACT raw request text before parsing JSON. Never replace it with JSON.stringify of a parsed object. The webhook header is `x-razorpay-signature`. During secret rotation, old retries require their old secret; this implementation supports one configured secret only, so drain retries before rotation or add a controlled dual-secret validation window.

Unknown events are acknowledged and ignored. Invalid signatures are rejected. Known events without a linked order return a retryable service error. Completed event IDs from `x-razorpay-event-id` are acknowledged as duplicates. Event completion is recorded AFTER successful reconciliation, so an interrupted handler can be retried. Concurrent duplicate event upserts can return a duplicate-index error, but unique purchase activation and provider reconciliation prevent a second membership; provider retry then finds the completed event.

## Database consistency and recovery

A Razorpay order/payment is an EXTERNAL provider operation. A MongoDB transaction protects only MongoDB writes. There is no distributed atomic transaction across them.

MongoDB transactions require a replica set. Pending Payment and Membership creation is one transaction. Captured-payment processing, access dates, successful state and email-outbox insertion are another. Concurrent activations for the same customer both write that customerâ€™s scheduleVersion; a write conflict causes the MongoDB transaction helper to retry and calculate a fresh queue boundary.

If Razorpay creates an order but saving its ID fails, recovery searches provider orders using the purchase receipt and accepts only exactly one matching amount/currency/receipt. The purchase is not silently re-created. Unclear or missing matches remain pending for operator inspection. External order creation timeouts may leave an uncertain result; the recoverer must establish provider state before another order is created. The browser persists a UUID request key in sessionStorage per user/plan. A unique customer/request-key index prevents duplicate pending purchase creation. Retrying the same key reuses the stored order or attempts receipt-based recovery; it never silently creates another order for an unresolved existing purchase. A separate purchase requires a new key. Operators should still inspect existing pending attempts if browser storage is cleared.

Run `npm run reconcile` in a trusted scheduler every few minutes. It scans unresolved purchases, fetches verified provider state, finishes activation and retries email outbox entries. Per-record errors report only purchase IDs, not secrets or payment payloads. A crash after activation but before event completion is harmless: the next callback/webhook sees processedAt and does not grant another period.

Paid membership start is the later of server time or the end of the customerâ€™s latest paid period, including suspended periods. Suspension changes access, not already-paid validity. Calendar months use UTC and clamp month ends; dashboard displays India time. End timestamps are exclusive. Expired/queued/active states are derived when rendering, so no cron is required merely to label expiry. Admin restoration cannot activate pending/unpaid memberships or revive an expired period.

## Email and staff invitations

Configure Resend and an approved sender. `onboarding@resend.dev` is a restricted testing sender; use a verified domain and permitted recipients for broader testing. Purchase confirmation includes dates and the captured payment reference. Invitations use random 256-bit tokens, store only SHA256 hashes, expire in 24 hours and are consumed in a transaction with staff creation. The email outbox must temporarily retain the invitation URL to deliver/retry it; restrict database access. Invite recipients must use the exact invited email. Existing-account promotion is intentionally not supported.

Outbox keys are unique and are sent as Resend idempotency keys. A one-minute database lease limits concurrent sending. Provider idempotency retention is finite; exact-once email delivery is NOT guaranteed after long retry gaps or rare lease overlaps. Pending errors are visible in the admin outbox count. Contact enquiries are sent directly, with a real provider acceptance response rather than a fake success. Purchase and invitation confirmation templates are branded plain-text for simplicity.

## Asset inventory and rights

The six candidate photographs are downloaded to `public/images` by `npm run assets`. The downloader rejects HTTP errors, non-image responses and suspiciously small responses, and generates `public/images/inventory.json` with exact URLs, timestamps and byte counts. These assets have NOT been downloaded or visually verified in this delivery. Do not call the image requirement complete until you run the downloader and review each photograph in a production build.

| File | Candidate source ID | Intended use |
|---|---|---|
| hero.jpg | photo-1534438327276-14e5300c3a48 | Hero / gym atmosphere |
| interior.jpg | photo-1571902943202-507ec2618e8f | About / facility environment |
| strength.jpg | photo-1517836357463-d25dfeac3438 | Strength editorial |
| cardio.jpg | photo-1538805060514-97d9cc17730c | Conditioning zone |
| equipment.jpg | photo-1581009146145-b5ef050c2e1e | Training equipment |
| functional.jpg | photo-1518611012118-696072aa579a | Movement showcase |

Sources are candidate `images.unsplash.com` photos. Consult https://unsplash.com/license and the individual source-photo pages before deployment. Attribution is appreciated; record photographers/source pages after verifying each asset. Image-license permission does not necessarily cover identifiable people, trademarks, artworks or private property. Never imply stock subjects endorse the gym. The trainer pages explicitly use illustrative training photographs, not portraits of named coaches. Replace unsuitable photos with verified licensed assets. Photos are reused as previews of the same fictional zones, not invented as separate facility records.

Fonts are downloaded npm Fontsource assets and served locally; retain their bundled license files. The geometric SVG vault wordmark and favicon are original simple artwork. PNG app icons are generated by Next.js ImageResponse routes. Next Image handles responsive optimization of local photos; hero loads with priority, other images are lazy. Image errors show a visible, consistently styled fallback, not a hidden broken icon. A fallback does not substitute for asset verification.

## Testing and deployment checklist

| Check | Current result |
|---|---|
| Generator syntax and execution | Not run |
| Stable dependency resolution / install | Not run |
| Domain tests: prices, capture checks, signatures, month-end dates, status derivation | Written; not run |
| ESLint | Not run |
| Production build | Not run |
| Assets HTTP download / visual review | Not run |
| Mobile, keyboard, dialogs and gallery browser verification | Not run |
| MongoDB transactions / concurrency / unique indexes | Not run |
| Registration, credentials and role/ownership integration tests | Not run |
| Razorpay signed callback / webhook / reconciliation | Not run; test credentials and public webhook required |
| Resend confirmations and invitations | Not run; configured sender and credentials required |

Run `npm test`, `npm run lint`, `npm run build`. Start the production build with `npm start`. Check every public route and image, logo and generated icons. Inspect browser console for hydration issues. Test widths 320, 375, 768, 1024 and 1440 px, long names/emails/references, reduced-motion mode, keyboard menu/lightbox/FAQ interaction and network failures. Native dialogs provide focus trapping and Escape behavior; verify focus returns to the trigger. Test contact with delivery disabled and enabled. Verify the exact enquiry destination before using real emails.

With a test replica-set database, exercise duplicate accounts, wrong passwords, logged-out routes, customer-to-staff/admin access denial, staff-to-admin denial, disabled staff sessions, expired/used invitations and cross-customer purchase IDs. All customer-owned reads filter on the authenticated user; reconciliation permits broader records only for currently authorized staff/admin. There is no customer endpoint accepting arbitrary member IDs.

For payments, test success, failure, checkout dismissal, invalid callback HMAC, modified raw webhook body, wrong amount/currency/order, authorized without capture, duplicate and out-of-order events, delayed webhooks, simultaneous purchases, second queued membership and transaction interruption. Kill processing after provider order creation and before database activation, then run the worker. Confirm exactly one Membership per Payment and no active unpaid access. Confirm email failure leaves paid access intact and the outbox retries. These integration scenarios are required acceptance tests; the included domain suite alone does not prove them.

Deploy on a Node-capable Next.js host, configure HTTPS AUTH_URL and server secrets, use Atlas, verify indexes, run the build, and configure the test webhook and scheduled worker. Do not perform writes during build/page rendering. Configure provider-approved recipients and a monitored operator contact address. Check all downloaded assets after deployment.

## Before any real-money launch

This version deliberately rejects live Razorpay keys. Do not remove that restriction as the only production change. Complete independent security review and integration tests; implement refund/dispute handling, legally reviewed terms/privacy/refund policies, email verification/account recovery, monitoring, backup/restore and abuse protection. Add a Razorpay-aware Content Security Policy only after testing hosted checkout domains and frames; this scaffold has security headers but no CSP. Deploy a trusted edge/WAF rate limiter: the included MongoDB per-email/account buckets are not sufficient against distributed signup or enquiry abuse. Configure retention/deletion processes and minimize retained invitation/outbox content. Have the real gym verify offerings, address, photos and pricing. Never represent fictional testimonials as real reviews.

## Known limitations

Not acceptance-complete until the unrun checks above pass. No browser preview was verified. Six candidate assets are supplied as download definitions rather than embedded verified image bytes. Trainer/profile previews reuse zone photography. Motion includes headline masks, parallax, native-dialog entrance, card response, route entrance and section transforms, but has not been profiled on mobile. No elaborate horizontal scroll sequence or custom cursor was added. Staff directory is capped at 100 matched accounts and omits accounts with no purchases; add pagination for a larger operation. Admin initial bootstrap should be run once in a controlled environment; concurrent bootstrap invocations are not a supported process. Email templates are plain-text rather than elaborate HTML. No refunds, MFA, password reset, email verification, recurring billing, attendance, class booking or health advice.

## References

Official payment and licensing sources consulted 23 October 2026:
- https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
- https://razorpay.com/docs/webhooks/validate-test.md
- https://unsplash.com/license

Package versions are not guessed in this document. `scripts/setup.mjs` resolves registry metadata when YOU run it and produces setup-report.json. Review its output and lockfile before deployment.
