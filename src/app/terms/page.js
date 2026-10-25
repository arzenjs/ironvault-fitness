import LegalPage from "@/components/layout/LegalPage";

export const metadata = {
  title: "Terms of service",
  description:
    "Terms covering IronVault Fitness memberships, payments, account responsibilities and limitations.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    id: "about-terms",
    title: "About these terms",
    body: [
      "These terms govern your use of the IronVault Fitness website and the memberships purchased through it. By creating an account or buying a plan you agree to them.",
      "Online payments are currently processed by Razorpay in test mode, which means no real money is charged for payments made on this website.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    body: [
      "You must provide accurate details when registering and keep your password confidential. We may disable accounts that are used to abuse the service.",
      "Public registration always creates a customer account. Staff and admin accounts are created only through a single-use invitation or the secure bootstrap script described in the README.",
    ],
  },
  {
    id: "memberships",
    title: "Memberships",
    body: [
      "Three plans are offered: Vault Monthly (₹1,499, 1 month), Vault Quarterly (₹3,999, 3 months) and Vault Annual (₹13,999, 12 months). All are one-time purchases with fixed durations. There is no automatic renewal and no stored payment method.",
      "A membership begins when the payment is verified and activated. Membership duration is calculated in calendar months on the server, with day-clamping at month ends (for example, 31 January plus one month ends 28 or 29 February).",
      "If you buy a second plan while a membership is still valid, the new plan is queued and starts when the current one ends. Paid days are never shortened. Queued memberships are shown separately in your dashboard.",
      "A membership may be suspended by an administrator for misuse. Suspensions record a reason and an audit entry.",
    ],
  },
  {
    id: "payments",
    title: "Payments and refunds",
    body: [
      "Payments are processed by Razorpay's hosted checkout. This application never receives or stores card numbers or CVV values.",
      "A membership is activated only after server-side verification of the payment signature and confirmation from Razorpay that the payment belongs to the order with the correct amount and currency. A browser redirect on its own never activates a membership.",
      "If a payment succeeds but activation is delayed, your payment page will keep checking and the dashboard will update when confirmation arrives. Duplicate provider notifications are handled idempotently, so you will not be charged or enrolled twice for the same payment.",
      "Refunds are not processed through the website. Refund requests are handled by the front desk and recorded against the original payment.",
    ],
  },
  {
    id: "conduct",
    title: "Using the facility",
    body: [
      "The facilities page lists the floor rules: re-rack weights, wipe equipment, share racks between sets, and report damaged equipment to a coach.",
      "Age, medical and conduct requirements for using the facility are explained at the front desk during your orientation.",
    ],
  },
  {
    id: "availability",
    title: "Availability and liability",
    body: [
      "The website is provided as-is, without warranty of uninterrupted availability. Features may change from time to time.",
      "Nothing on this site constitutes medical advice. Anyone starting a training program should consult a qualified professional, particularly with existing injuries or health conditions.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "Questions about these terms can go through the contact form or to the address listed in the footer.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="23 October 2026"
      intro="The rules that apply to your membership: what the plans are, how payments activate a membership and what to expect at the facility."
      sections={sections}
    />
  );
}
