# IronVault Fitness

A premium, animation-led gym website with a real membership purchase flow.

> **Content status (developers).** The address, phone number, coach profiles, statistics, testimonials and
> photography are placeholder content — replace them with real details before launch (`src/config/*`).
> Payments run in **Razorpay test mode** until live keys are configured; the public site only states the
> payment mode where it matters (checkout, plan cards, payment FAQ, terms). The legal pages have not been
> legally reviewed.

---

## 1. Project overview

IronVault is a strength-first gym site built to show three things at once:

1. **A distinctive visual identity** — dark industrial palette, condensed display type, editorial layouts and photography-led sections, instead of a generic gym template.
2. **Motion as a system** — an art-directed hero, per-section motion concepts, route transitions, pointer-responsive cards, an accessible lightbox and a reduced-motion path.
3. **A real, inspectable commerce backend** — Auth.js accounts, server-trusted pricing, Razorpay test-mode checkout, signed webhooks, idempotent activation, queued renewals, a customer dashboard, a staff lookup tool and an admin console.

### Pages

| Public | Account | Staff / Admin | API |
| --- | --- | --- | --- |
| `/` home | `/login` | `/staff` member lookup | `/api/auth/[...nextauth]` |
| `/about` | `/register` | `/admin` overview + metrics | `/api/register` |
| `/memberships` | `/checkout?plan=` | `/admin/members` memberships (suspend / reinstate) | `/api/contact` |
| `/facilities` | `/checkout/result?ref=` | `/admin/users` accounts (enable / disable) | `/api/payments/create-order` |
| `/trainers` | `/account` | `/admin/staff` invitations + team | `/api/payments/verify` |
| `/gallery` | | `/admin/payments` records + reconciliation | `/api/payments/status` |
| `/contact` | | `/admin/audit` audit log | `/api/payments/abandon` |
| `/faq` | | `/staff/accept-invite` | `/api/webhooks/razorpay` |
| `/privacy`, `/terms` | | | `/api/staff/reconcile` |
| | | | `/api/admin/invitations` |
| | | | `/api/admin/memberships` |
| | | | `/api/admin/users` |
| | | | `/api/invitations/accept` |

---

## 2. Technology stack

| Layer | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router, React Server Components) | 16.4.3 |
| UI | React | 19.3.1 |
| Language | JavaScript (`.js`, no TypeScript) | — |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) | 4.3.3 |
| Icons | lucide-react | 1.61.0 |
| Animation | `motion` (Framer Motion successor, `motion/react` API) | 14.6.0 |
| Database | MongoDB + Mongoose | 8.24.6 |
| Auth | Auth.js (NextAuth) v5, Credentials + JWT sessions | 5.0.0-beta.32 |
| Payments | Razorpay Node SDK + hosted Checkout | 2.9.8 |
| Email | Resend | 6.34.1 |
| Validation | Zod | 4.6.7 |
| Hash | bcryptjs | 3.0.3 |

**Compatibility notes**

- The newest stable Next.js is **16.4.3** rather than 15.x. Next 15.5 pins a `postcss` build with open advisories; Next 16 removes them (`npm audit` reports **0 vulnerabilities**). NextAuth v5 beta 32 declares `next: ^14 || ^15 || ^16` support, so the pairing is supported. Next 16 also moved `middleware.js` → `proxy.js`, which this repo uses.
- `motion` is the actively maintained successor to `framer-motion` with the same `motion/react` import path, so migration later is trivial.
- Tailwind v4 needs no `tailwind.config.js`; design tokens live in `src/styles/globals.css` under `@theme`.

---

## 3. Prerequisites

- Node.js **20.9+** (developed on 20.20)
- npm 10+
- A MongoDB database (local `mongod`, Docker, or a free Atlas cluster)
- Optional for payments: a Razorpay account in **test mode**
- Optional for email: a Resend account with a verified sending domain

---

## 4. Installation and local development

```bash
cd ironvault
npm install
cp .env.example .env.local     # then fill in the values (section 5)
npm run dev                    # http://localhost:3000
```

Other commands:

```bash
npm run build     # production build
npm start         # serve the production build
npm run lint      # ESLint (eslint-config-next, core-web-vitals)
npm test          # unit + integration tests (see section 17)
```

---

## 5. Environment variables

`.env.example` is the source of truth; every variable below is actually read by the code.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes | Mongo connection string. Without it, database-backed routes return a clear 503. |
| `AUTH_SECRET` | yes | Signs the Auth.js JWT. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `AUTH_URL` | production | Canonical app URL. Optional on localhost. |
| `AUTH_TRUST_HOST` | optional | `true` behind a proxy/Vercel when `AUTH_URL` is unset. |
| `RAZORPAY_KEY_ID` | for payments | Publishable test key (`rzp_test_…`). Safe to expose; it is sent to the browser by an API response. |
| `RAZORPAY_KEY_SECRET` | for payments | **Server only.** Signs/verifies checkout signatures. |
| `RAZORPAY_WEBHOOK_SECRET` | for webhooks | **Server only.** Verifies webhook signatures. |
| `RESEND_API_KEY` | for email | Leave empty to disable sending — the app logs a warning and continues. |
| `RESEND_FROM_EMAIL` | for email | The **sender** identity. Must be a verified sender, e.g. `IronVault <memberships@yourdomain.com>`. Not a contact or invitation address. |
| `CONTACT_INBOX_EMAIL` | optional | Overrides `gym.contactEmail` as the destination of contact-form notifications (and the reply-to of welcome / membership emails). Customer-facing. |
| `STAFF_INVITE_EMAIL` | optional | Overrides `gym.staffInviteEmail`, the reply-to of staff/admin invitation emails. Never used for customer mail. |
| `NEXT_PUBLIC_SITE_URL` | production | Used in metadata, sitemap and invitation links. |
| `MONGODB_TEST_URI` | tests only | Enables the integration suite. |

**Never** commit `.env.local` (it is git-ignored). No secret is referenced from a client component — `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `AUTH_SECRET` and `RESEND_API_KEY` are only read inside `src/lib/*` and `src/services/*`, which run on the server.

---

## 6. MongoDB configuration

**Local**

```bash
docker run -d --name ironvault-mongo -p 27017:27017 mongo:7
# MONGODB_URI=mongodb://127.0.0.1:27017/ironvault
```

**Atlas** — create a free cluster, add a database user, allow your IP, copy the SRV string into `MONGODB_URI`.

Mongoose creates collections and indexes on first use. The important ones:

| Collection | Index | Why |
| --- | --- | --- |
| `users` | `email` unique | one account per address |
| `payments` | `razorpayOrderId` unique + sparse | one local row per order |
| `payments` | `razorpayPaymentId` unique + sparse | one local row per captured payment |
| `memberships` | `paymentId` unique + sparse | **one membership per payment** (the idempotency guarantee) |
| `invitations` | `tokenHash` unique | single-use staff invites |

> Both unique fields are **left unset** rather than `null` until a value exists. A sparse unique index skips missing fields but still enforces uniqueness on explicit `null`s — defaulting them to `null` would allow only one unpaid payment ever. (This was caught by the integration tests and is why `tests/payments.integration.test.js` exists.)

### Seeding and bootstrap

```bash
npm run seed-demo      # customer + staff + two memberships (dev only)
npm run create-admin -- --email=you@example.com --name="Gym Owner"
```

---

## 7. Initial admin creation

There is **no public endpoint** that can create an admin or staff account.

```bash
npm run create-admin -- --email=owner@example.com --name="Gym Owner"
```

- Loads `.env.local`, connects directly to MongoDB.
- Reads the password from `CREATE_ADMIN_PASSWORD` if set, otherwise prompts with hidden input (so it never lands in shell history):
  `CREATE_ADMIN_PASSWORD='something-strong1' npm run create-admin -- --email=…`
- Refuses to touch an existing account unless you pass `--promote`, so it cannot silently take over a user.
- Enforces at least 10 characters with a letter and a number.

Sign in at `/login`, then open `/admin`.

---

## 8. Authentication configuration

- **Auth.js v5** with a single **Credentials** provider (email + password) and **JWT sessions** (7 days). No adapter session collection is needed.
- Passwords are hashed with **bcrypt, cost 12**; `passwordHash` is `select: false` so it never loads by accident.
- `authorize()` validates with Zod, compares against a dummy hash for unknown emails (so timing does not reveal whether an account exists), and rejects `disabled` accounts.
- Public registration (`/api/register`) **hard-codes `role: "customer"`**. Staff/admin accounts only come from invitations or the bootstrap script.
- The JWT carries `id`, `role`, `status`. Because roles can change after a token is issued, **every privileged server action re-reads the user from MongoDB** (`requireRole` in `src/lib/security.js`). Disabling a staff account therefore takes effect immediately.

### Authorisation layers

1. `src/proxy.js` — redirects visitors with **no session cookie** away from `/account`, `/checkout`, `/staff`, `/admin`. Convenience only; it never makes role decisions.
2. Page-level checks — `/staff` compares the session role; every `/admin` page calls `adminGuard()` (`src/lib/admin-guard.js`), which re-reads the user from MongoDB, redirects signed-out visitors to `/login?next=…` and renders an access-denied screen for staff, customers and disabled accounts. The admin layout only hides the admin chrome; it is never the security boundary.
3. API-level checks — `requireUser()` / `requireRole([...])` in every route handler. **This is the real boundary.**

Ownership is enforced by putting the user id in the *query*, never by filtering afterwards:
`Payment.findOne({ _id: ref, userId: user.id })`. Changing an id in a URL returns 404, not someone else's data.

---

## 9. Razorpay test-mode setup

1. Create an account at <https://dashboard.razorpay.com> and switch to **Test Mode**.
2. **Settings → API Keys → Generate key**. Copy the Key ID (`rzp_test_…`) and Key Secret into `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
3. Test-mode payments need no real bank data. In Checkout use the test instruments (e.g. UPI success `success@razorpay`, or the test card `4111 1111 1111 1111` with any future expiry/CVV — Razorpay's docs list the current set).
4. Restart the dev server after changing environment variables.

Docs used: [Orders](https://razorpay.com/docs/api/orders/), [Payments](https://razorpay.com/docs/api/payments/), [Signature verification](https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#verify-payment-signature), [Webhooks](https://razorpay.com/docs/webhooks/).

---

## 10. Configuring and testing webhooks

The webhook is the **authoritative** confirmation signal. Without it the flow still works (the verify route calls Razorpay's API), but webhooks are what make delayed or closed-tab payments recoverable.

**Local testing**

```bash
# terminal 1
npm run dev
# terminal 2 — expose localhost
ngrok http 3000     # or: cloudflared tunnel --url http://localhost:3000
```

In **Dashboard → Settings → Webhooks → Add New Webhook**:

- URL: `https://<your-tunnel>/api/webhooks/razorpay`
- Secret: the value you put in `RAZORPAY_WEBHOOK_SECRET`
- Active events: `payment.captured`, `payment.failed`, `order.paid`, `order.expired`

Make a test payment, then check **Dashboard → Webhooks → (your endpoint) → Logs**. A delivery is successful when the endpoint replies `2xx`.

There is also a **staff/admin "Reconcile"** button (`POST /api/staff/reconcile`) and a CLI job:

```bash
npm run reconcile              # dry run: list payments older than 60s that are not settled
npm run reconcile -- --apply   # ask Razorpay and update each record
```

---

## 11. How signature verification works

Two different signatures, two different secrets.

**A. Checkout callback** (`POST /api/payments/verify`)

```
expected = HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
valid    = timingSafeEqual(expected, razorpay_signature)
```

Implemented in `verifyPaymentSignature()` (`src/lib/razorpay.js`) with `crypto.timingSafeEqual`.

**B. Webhook** (`POST /api/webhooks/razorpay`)

```
expected = HMAC_SHA256(raw_request_body, RAZORPAY_WEBHOOK_SECRET)
```

The route reads the body with `await request.text()` — the **raw bytes** — because re-serialising JSON changes key order/spacing and breaks the HMAC. This is asserted by a unit test that shows a re-stringified body fails verification.

**A valid signature is not the last word.** After the signature check the server also fetches the payment from Razorpay and requires:

- `payment.order_id === payment.razorpayOrderId` (our record),
- `payment.amount === payment.amountPaise` (from the plan config),
- `payment.currency === "INR"`,
- `payment.status` is `authorized` or `captured`.

Any mismatch parks the payment in `review` — it never activates a membership.

---

## 12. How duplicate deliveries are handled

Three layers of idempotency:

1. **Webhook event id** — `x-razorpay-event-id` is stored in `payment.webhookEvents`. A replayed id returns `{ duplicate: true }` immediately.
2. **Payment state** — if the record is already `successful`, any `payment.captured` / `order.paid` event short-circuits, and a **late `payment.failed` can never un-pay** a verified membership.
3. **Database constraint** — `Membership.paymentId` is a unique index. Even if the verify route and the webhook run at the same instant, only one membership row can exist; the loser catches `E11000` and returns the existing row.

`tests/payments.integration.test.js` proves this with a real MongoDB: same event twice, plus a second event id for the same payment, still yields exactly one membership.

---

## 13. Razorpay payment vs. a MongoDB transaction

These are different things and must not be confused:

- A **Razorpay order/payment** lives in Razorpay's system. It is created and captured over HTTPS, outside your database.
- A **MongoDB transaction** can atomically change several documents in *your* database — and nothing else.

You therefore **cannot** make "money captured at Razorpay" and "membership activated in MongoDB" one atomic operation. Any architecture claiming otherwise is either using an outbox/saga with the same failure modes, or is wrong. This project is explicit about the gap and makes it recoverable instead.

The app also **does not use MongoDB multi-document transactions at all**, so it runs on a standalone `mongod` as well as an Atlas replica set — no `replica set` requirement to deploy.

---

## 14. Database consistency strategy

**Ordering.** Always write the local record first, then talk to the provider:

```
Payment(status=created) → Razorpay order → Payment(status=pending, razorpayOrderId)
   → capture → verify → Membership created → Payment(status=successful, membershipId)
```

**The one gap.** Between "membership created" and "payment marked successful" a crash would leave `payment.status = pending` with a membership that exists. That is safe and self-healing:

- the webhook retry (Razorpay retries for ~24h) calls `activateMembershipForPayment` again,
- it finds the existing membership (unique index), skips creation, and finishes the payment update,
- if Razorpay's retries are exhausted, `npm run reconcile -- --apply` or the staff Reconcile button does the same.

**Detecting incomplete work.** Anything left in `created` / `pending` / `review` older than a minute is visible in:
`/staff` → "Payments needing reconciliation", `/admin` → "Needs reconciliation", and `npm run reconcile` (dry run).

**The reverse gap** (payment says successful, membership missing) is impossible by ordering, but is still covered: `serialisePayment` uses `payment.membershipId`, and every dashboard reads memberships directly.

**What is *not* claimed:** payment and activation are **not atomic** across Razorpay and MongoDB. They are *eventually consistent*, with idempotent, retryable convergence in one direction (never activate on unverified data) and explicit reconciliation in the other.

---

## 15. Membership activation, expiry and queued plans

**Activation** — only in `activateMembershipForPayment()`, only after verification (signature + provider state, or a signed webhook). A browser redirect alone never activates.

**Duration** — calendar months with day clamping (`src/lib/dates.js`):

| Start | Plan | Ends |
| --- | --- | --- |
| 31 Jan | 1 month | 28 Feb (29 Feb in a leap year) |
| 31 Aug | 3 months | 30 Nov |
| 29 Feb 2024 | 12 months | 28 Feb 2025 |

Plain `setMonth()` would overflow 31 Jan into 3 March and silently give extra days.

**Queued renewals** — if the customer already has time left (active, not suspended, `endDate > now`), the new plan starts exactly when the latest paid period ends:

```
newStart = max(end of all still-valid memberships, now)
newEnd   = addMonthsClamped(newStart, durationMonths)
```

So buying an annual plan while a monthly one is active keeps the monthly days, marks the annual row `queued`, and shows both in `/account`. Paid time is never shortened.

**Expiry** — `status` is a cache. Every view derives the real state from the dates (`deriveMembershipState`), so an expired membership can never look active just because a job did not run. `suspended` (set by an admin, with a reason) always wins.

---

## 15b. Admin dashboard and role-based sign-in

`/admin` is a dedicated admin area with its own layout (`app/admin/layout.js`, `components/admin/*`): sidebar on desktop, scrollable section bar on phones, a "Back to website" link and sign-out. The public header and footer are not rendered there (`components/layout/SiteChrome.js`).

| Section | What it does | Backed by |
| --- | --- | --- |
| Overview | revenue, active/queued/suspended memberships, accounts, open invitations, payments needing attention, recent audit entries | `services/admin.js` (read-only) |
| Members | search; suspend / reinstate memberships (reason required, audited); disable / enable the member's account | `/api/admin/memberships`, `/api/admin/users` |
| Accounts | every account, filter by role and status; enable / disable | `/api/admin/users` |
| Staff & invites | create invitations, see invitation state, staff and admin accounts | `/api/admin/invitations`, `services/invitations.js` |
| Payments | all payment records with filters, search and **Reconcile** for created / pending / review rows | `/api/staff/reconcile` |
| Audit log | paginated log of privileged actions | `AuditLog` |

**Sign-in destinations** (`src/lib/redirects.js`): after login the role decides where you land — customer → `/account`, staff → `/staff`, admin → `/admin`. A `?next=` path is honoured only if it is a same-site relative path **and** the role may open it (so a customer cannot be steered into `/admin`); `//host`, `/\host`, absolute URLs and control characters are rejected. The role is read from the session issued by the login, never from the URL.

All mutations keep using the existing admin-checked API routes; the dashboard adds no second code path for them.

---

## 16. Resend setup and email testing

1. Create a Resend account, add and verify your sending domain (DNS records).
2. Create an API key → `RESEND_API_KEY`; set `RESEND_FROM_EMAIL` (must be on the verified domain).
3. Restart. Emails sent: **welcome**, **membership confirmed** (plan, amount, start/end dates, payment reference), **staff invitation**, **contact-form notification**.

**Three different addresses — do not mix them up.**

| Setting | Purpose | Used by |
| --- | --- | --- |
| `RESEND_FROM_EMAIL` | sender identity (verified Resend sender) | every outgoing email |
| `gym.contactEmail` (override: `CONTACT_INBOX_EMAIL`) | customer-facing business address | site footer, contact page, privacy policy; contact-form notifications are delivered **to** it; reply-to on welcome and membership-confirmation emails |
| `gym.staffInviteEmail` (override: `STAFF_INVITE_EMAIL`) | staff/admin invitation address | reply-to on staff and administrator invitation emails only |

There is deliberately no fallback between the two business addresses. If an address is empty the corresponding email is skipped (contact notification) or sent without a reply-to (invitations), with a console warning — it is never silently redirected to the other mailbox. The invitee receives the invitation at the address the admin typed; `gym.staffInviteEmail` only receives their replies.

**Email must never fail a payment.** Sending happens *after* activation, inside a `try/catch`; a failure is logged and stored in `payment.emailError` while `payment.emailSentAt` stays empty — both are visible for follow-up. With Resend unset, the app logs `[email] skipped …` and continues normally.

In test mode, Resend only delivers to the address that owns the account unless you verify a domain. Use Resend's test address or your own inbox; the console output tells you whether delivery was attempted or skipped.

---

## 17. Linting, build and testing commands

```bash
npm run lint                   # ESLint — clean
npm run build                  # production build — clean
npm test                       # 37 tests (22 unit + 15 integration when a DB is provided)
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/ironvault_test npm test
```

What the suite covers:

| File | Covers |
| --- | --- |
| `tests/dates.test.js` | month-end clamping, leap years, year boundaries, queued start dates |
| `tests/security.test.js` | checkout HMAC, webhook raw-body HMAC, token hashing, open-redirect protection, rate limiter |
| `tests/validation.test.js` | plan config as the price source, client amount stripping, password/contact/admin rules |
| `tests/membership-status.test.js` | derived active/queued/expired/suspended states |
| `tests/payments.integration.test.js` | webhook signature rejection, activation, duplicate delivery, amount/currency mismatch, failed-then-success ordering, queued second purchase, concurrent activation, provider validation |

`tests/register-loader.mjs` is a small resolver hook so `node --test` understands the `@/` alias and extensionless imports — no test framework or build step is added to the app.

---

## 18. Deployment

1. Push the repo (`.env.local` is ignored).
2. Create a project on Vercel (or any Node host) and set the environment variables from section 5. Set `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` to the deployed origin.
3. Point `MONGODB_URI` at Atlas and allow the host's egress IPs (or `0.0.0.0/0` for a demo).
4. Add the production webhook URL in Razorpay pointing at `https://your-domain/api/webhooks/razorpay`.
5. Run `npm run create-admin -- --email=…` against the production database **locally** (it uses your `.env.local`); the invite flow creates everyone else.
6. After deploying, open `/`, `/gallery` and `/memberships` in a private window and confirm images, fonts and the lightbox.
7. `next/image` optimises from `/public` at runtime; on a non-Vercel host keep `sharp` available (Next installs it automatically for standalone builds).

---

## 19. What must change before real-money payments

This app is deliberately **test-mode only**. Before charging real money:

1. Swap the Razorpay keys for **live** keys and set a **live** webhook with its own secret. Never reuse the test webhook secret.
2. Create the production webhook endpoint **before** going live; test it with a ₹1 live payment.
3. Serve over HTTPS only and add a strict Content-Security-Policy (Checkout needs `checkout.razorpay.com` in `script-src`/`frame-src`).
4. Replace the in-memory rate limiter with a shared store (Upstash Redis, etc.) — see limitations below.
5. Decide the business rules this demo leaves open: refunds, cancellations, transfers, tax/GST invoicing, and a real accounting export of successful payments.
6. Add monitoring/alerting on `payment.status = review`, on webhook non-2xx responses, and on `emailError`.
7. Run a written reconciliation at least daily (`npm run reconcile`) until you trust the webhook pipeline.
8. Get the terms, privacy policy and refund policy legally reviewed — the versions here are demo text.
9. Consider Razorpay's **route/marketplace** or payment-links if you add multiple branches; not needed for a single location.

---

## 20. Known limitations and unverified behaviour

**Verified in this repo** (commands actually run): `npm run lint`, `npm run build`, `npm test` (37/37 with a MongoDB instance), Playwright checks at 360/390/768/1024/1440/1920 px for horizontal overflow, all public pages returning 200 with no broken images, registration → login → account, duplicate registration (409), weak password (422), logged-out redirects, customer blocked from `/staff` and `/admin`, contact-form submission, gallery lightbox with Escape, and a signed webhook activating a membership end-to-end against the running app.

**Not verifiable without your credentials**

- A **real Razorpay checkout popup** and a real captured test payment: this environment has placeholder keys, so order creation returns `Authentication failed` (handled as a friendly error). The webhook path was verified by signing payloads with the configured secret.
- **Resend delivery**: no API key, so emails are skipped (by design) and only logged.
- **Google Maps iframe**: the embed is loaded from `google.com`; it renders in a normal browser but is blocked in restricted sandboxes.

**Deliberate limitations**

- **No recurring billing**, refunds, pause/transfer, class booking, workout tracking or trainer booking — out of scope (section 22 of the brief).
- **Rate limiting is per-instance** (`Map` in `src/lib/security.js`). Multi-instance deployments should move it to a shared store.
- `loading.js` exists for `/account` and `/staff` (both wait on the database and use layout-matched skeletons). Static marketing pages render instantly, so a skeleton there would only add noise.
- Speculative checkouts are not cleaned up automatically; `npm run reconcile` closes them as `abandoned` once Razorpay says there is no captured payment.
- Photos are generated or Unsplash stock imagery representing a fictional gym; the coach portraits are unrelated models.
- Because Next 16 removed some class-name heuristics, `src/proxy.js` (not `middleware.js`) is used for the cookie guard.

---

## 21. Payment lifecycle, step by step

**"Join Now" → an active membership.**

1. **Choose a plan** (`/memberships`). The browser knows only `planId`.
2. **Not signed in?** The CTA sends you to `/login?next=/checkout?plan=vault-quarterly`; registration carries the same `next`, so the plan survives authentication.
3. **`/checkout` (server)** re-reads the plan from `src/config/membership-plans.js`. An unknown id renders "Choose a plan first" — the URL cannot set a price.
4. **Click Pay.**
5. **`POST /api/payments/create-order`** (authenticated):
   - stores `Payment { status: "created" }` with the plan's price in paise and its duration,
   - creates the Razorpay order with `amount` from config and `currency: "INR"`,
   - saves `razorpayOrderId` and flips the row to `pending`,
   - returns only `keyId`, `orderId`, `amount`, `currency` and prefill data to the browser.
6. **Razorpay Checkout opens** (hosted iframe). Card/UPI details never touch this app or its server.
7. **On success** Checkout returns `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.
8. **`POST /api/payments/verify`**:
   - loads the payment **by id *and* user id** (ownership),
   - rejects if the order does not match,
   - verifies the HMAC signature,
   - fetches the payment from Razorpay and checks order, amount, currency, status,
   - calls `activateMembershipForPayment()` → `Membership` created (`active`, or `queued` if time remains),
   - marks the payment `successful`, stores `membershipId` and `verifiedAt`,
   - sends the confirmation email (best-effort).
9. **`/checkout/result?ref=…`** shows the real state and keeps polling `/api/payments/status` for ~60 s, so a slow webhook resolves without a manual refresh.
10. **Webhook** (`payment.captured`) arrives independently, passes the raw-body HMAC, and runs the same activation — idempotently. If the browser tab died in step 7, **this is what activates the membership.** If the customer closed the modal, the attempt is marked `abandoned`, but a late capture still activates it.
11. **`/account`** lists the membership, its dates, days remaining, queued plan and every payment attempt with its Razorpay reference.

Failure branches: bad signature → `review`; amount/currency mismatch → `review`; `payment.failed` → `failed` (never activates); closed window → `abandoned`; anything stale → reconcile.

---

## 22. Source map

```text
src/
  app/                     routes (RSC by default; client only where interactive)
    api/                   route handlers (server-only)
    account/ checkout/ staff/ admin/ …   pages
    layout.js template.js error.js not-found.js loading.js
  components/
    layout/  ui/  home/  memberships/  gallery/  account/  dashboard/  auth/  contact/
  config/
    gym.js                 business identity, hours, map links
    membership-plans.js    THE price/duration source of truth
    navigation.js  media.js  facilities.js  trainers.js  faq.js  testimonials.js
  lib/
    db.js auth.js razorpay.js email.js validation.js security.js
    dates.js membership-status.js format.js redirects.js session.js motion.js fonts.js
  models/                  User, Membership, Payment, Invitation, AuditLog, ContactMessage
  services/
    memberships.js         activation, derived state, suspension + audit
    payments.js            order → verify → webhook → reconcile
    invitations.js         hashed single-use staff invites
    staff.js               member search
  styles/globals.css       design tokens + shared component classes
  proxy.js                 cookie-level route guard
scripts/
  create-admin.js  seed-demo.js  reconcile-payments.js
public/images/             downloaded, optimised photography (see below)
tests/                     node:test suites + @/ resolver hook
```

---

## 23. Asset inventory

All photography is **downloaded into `public/images/`** (nothing is hot-linked) and served through `next/image`, so `public/images` is the only source and every extra size is generated at request time.

### Licence

- **Unsplash photos** — [Unsplash License](https://unsplash.com/license): free for commercial and non-commercial use, no attribution required (credit appreciated). They are used here to represent a fictional business and do not depict its staff or members.
- **Generated images** (`facilities/locker-room.jpg`, `site/gym-exterior.jpg`, `site/og-cover.jpg`) — AI-generated for this project specifically; no third-party rights involved. The OG cover composites a licensed Unsplash photo with the IronVault wordmark.
- **Logo, favicon, icons** — original SVG created for this project (`public/favicon.svg`, `src/app/icon.svg`, `src/app/apple-icon.png`, `src/components/ui/Logo.js`).

### Inventory

| File | Used in | Unsplash ID |
| --- | --- | --- |
| `hero/hero-athlete.jpg` | home hero | `photo-1581009146145-b5ef050c2e1e` |
| `hero/hero-dumbbell-aisle.jpg` | home hero back panel | `photo-1534438327276-14e5300c3a48` |
| `hero/hero-rope.jpg` | spare hero art | `photo-1605296867304-46d5465a13f1` |
| `about/barbell-back.jpg` | about hero, login panel | `photo-1526506118085-60ce8714f8c5` |
| `about/group-training.jpg` | philosophy, trainers hero | `photo-1567013127542-490d757e51fc` |
| `about/group-class.jpg` | philosophy inset, about | `photo-1518611012118-696072aa579a` |
| `about/floor-stretch.jpg` | about story | `photo-1593079831268-3381b0db4a77` |
| `facilities/strength-rack.jpg` | facilities (02/01) | `photo-1574680096145-d05b474e2155` |
| `facilities/resistance-dumbbells.jpg` | facilities (02) | `photo-1583454110551-21f2fa2afe61` |
| `facilities/cardio-floor.jpg` | facilities (03) | `photo-1540497077202-7c8a3999166f` |
| `facilities/functional-turf.jpg` | facilities (04) | `photo-1591258370814-01609b341790` |
| `facilities/locker-room.jpg` | facilities (05) | generated |
| `trainers/trainer-01…04.jpg` | coaches | `photo-1571731956672-f2b94d7dd0cb`, `photo-1549476464-37392f717541`, `photo-1550345332-09e3ac987658`, `photo-1530822847156-5df684ec5ee1` |
| `gallery/gallery-01…14.jpg` | gallery + home strip | `1611672585731-fa10603fb9e0`, `1521805103424-d8f8430e8933`, `1526401485004-46910ecc8e51`, `1541534741688-6078c6bfb5c5`, `1548690312-e3b507d8c110`, `1552196563-55cd4e45efb3`, `1534258936925-c58bed479fcb`, `1584466977773-e625c37cdd50`, `1594381898411-846e7d193883`, `1554284126-aa88f22d8b74`, `1571019613454-1cb2f99b2d8b`, `1638536532686-d610adfc8e5c`, `1599058917765-a780eda07a3e`, `1517838277536-f5f99be501cd` |
| `site/training-cta.jpg` | final CTA, auth panel, gallery hero | `photo-1616803689943-5601631c7fec` |
| `site/community.jpg` | about | `photo-1552674605-db6ffd4facb5` |
| `site/gym-exterior.jpg` | contact hero, location band | generated |
| `site/og-cover.jpg` | social preview (1200×630) | composite |

Reproduce a source file with:
`https://images.unsplash.com/<ID>?auto=format&fit=crop&w=1200&q=80`

### Image handling

- Fixed intrinsic `width`/`height` on every `SmartImage`, with `fill` + `sizes` for responsive crops (no layout shift).
- `priority` only on the hero and auth-side images; everything below the fold is lazy by default.
- `SmartImage` renders a branded fallback panel (vault mark + "Image unavailable") if a file ever fails to decode, instead of a broken-image icon.
- Alt text is descriptive for informative images and empty for decorative ones (`alt=""` on backdrops and the final CTA overlay).
- Descriptive filenames, grouped by purpose (`hero/`, `facilities/`, `trainers/`, `gallery/`, `about/`, `site/`).

---

## 24. Design and motion notes (for future edits)

- **Tokens** live in `src/styles/globals.css` (`@theme`): `ink`, `coal`, `steel`, `graphite`, `fog`, `ash`, `signal`, `ember`, plus `--font-display` (Anton), `--font-sans` (Inter), `--font-mono` (JetBrains Mono) loaded through `next/font`.
- **Section rhythm** uses `.section`, `.shell` and `.shell-tight`; type uses `.display` / `.display-tight`, `.eyebrow`, `.lede`.
- **Motion** primitives: `Reveal`, `RevealImage`, `SplitText`, `StatCounter`, `Accordion`, `Marquee` in `src/components/ui`. Shared easings/variants in `src/lib/motion.js`.
- Only `transform`/`opacity` animate. Card tilt and spotlight use CSS variables written on `pointermove` (no React re-render).
- `prefers-reduced-motion` is honoured: a global CSS override plus component-level `useReducedMotion` checks that swap to static markup, so nothing can be left invisible.
- A `<noscript>` rule un-hides `[data-reveal]` elements if JavaScript never runs.
- Performance guardrails kept deliberate: no full-page blur, no scroll-jacking, no intro loader, images sized per breakpoint, animation confined to the viewport.
