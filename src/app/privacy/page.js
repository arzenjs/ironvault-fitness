import LegalPage from "@/components/layout/LegalPage";
import { gym } from "@/config/gym";

export const metadata = {
  title: "Privacy policy",
  description:
    "What data the IronVault Fitness demo collects, where it is stored, which third parties are involved and how to request removal.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    id: "scope",
    title: "Scope of this policy",
    body: [
      "This policy describes the data practices of the IronVault Fitness demo application — a portfolio project. IronVault Fitness is a fictional business; there is no real gym collecting your data. The practices below describe what the code in this repository actually does.",
      "This document has not been legally reviewed and is not a compliance certification. It exists so the demo's real data flows are documented honestly.",
    ],
  },
  {
    id: "collected",
    title: "What we collect",
    body: [
      "Account data: your name, email address, an optional phone number, and a bcrypt hash of your password. Raw passwords are never stored or logged.",
      "Membership data: which plan you purchased, the amount, start and expiry dates, and its current state (active, queued, expired or suspended).",
      "Payment data: the Razorpay order ID, payment ID, amount, currency, provider status, and an audit trail of webhook events. Card numbers, CVVs, UPI PINs and bank credentials are never sent to or stored by this application — Razorpay's hosted checkout collects them on Razorpay's infrastructure.",
      "Contact form data: the name, email, optional phone, topic and message you submit.",
      "Administrative audit data: when a staff or admin account performs a privileged action (for example suspending a membership), the actor, target, reason and timestamp are recorded.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and sessions",
    body: [
      "Authentication uses Auth.js with a signed JWT session cookie. It contains your user id, role and account status, is HTTP-only, and expires after seven days. There are no advertising cookies, tracking pixels or third-party analytics scripts in this application.",
    ],
  },
  {
    id: "use",
    title: "How the data is used",
    body: [
      "To authenticate you and show your own memberships and payment history (ownership is checked on the server for every request).",
      "To create Razorpay orders, verify payment signatures, process webhooks and activate memberships.",
      "To send transactional emails: account confirmation, membership confirmation and staff invitations. Email is sent through Resend when it is configured.",
      "To respond to contact-form messages and to let staff resolve billing questions.",
    ],
  },
  {
    id: "third-parties",
    title: "Third parties",
    body: [
      "Razorpay — payment order creation, hosted checkout and payment status. Subject to Razorpay's own privacy policy.",
      "Resend — transactional email delivery. Receives the recipient address and message content.",
      "MongoDB — the database where the records above are stored.",
      "Google Maps — the contact page embeds Google Maps, which may set its own cookies and receives your IP address when the iframe loads. Google Maps links open in a new tab.",
    ],
  },
  {
    id: "retention",
    title: "Retention and deletion",
    body: [
      "Membership and payment records are kept for the life of the demo database so the dashboard and staff tools have history to display.",
      "This demo does not implement self-service account deletion. In a production deployment, deletion requests would be handled manually by an administrator and would remove account data while retaining the minimum payment records required for accounting.",
    ],
  },
  {
    id: "security",
    title: "Security measures",
    body: [
      "Passwords are hashed with bcrypt (cost 12). Sessions are signed with a server-side secret. All privileged routes re-check the user's role and status against the database rather than trusting the token alone.",
      "Payment signatures are verified with HMAC-SHA256 using server-only secrets; webhook payloads are verified against the raw request body. Secrets are stored in environment variables and never included in the client bundle.",
      "Rate limiting is applied to registration, login attempts, contact submissions and payment verification. The limiter is in-memory and therefore per-instance — see the README for the production caveat.",
    ],
  },
  {
    id: "rights",
    title: "Your choices",
    body: [
      "You can view your own membership and payment records at any time from the account dashboard.",
      `To ask a question about your data, email ${gym.email}. In this demo no real data is processed at that address.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="23 October 2026"
      intro="A plain-language description of the data this demo collects, why it exists and where it goes. Written to match the actual code — not a generic template."
      sections={sections}
      footerNote="Demo notice: IronVault Fitness is fictional and this policy is illustrative. It has not been legally reviewed and is not a statement of compliance with any specific regulation."
    />
  );
}
