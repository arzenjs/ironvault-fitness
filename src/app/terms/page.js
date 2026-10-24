import LegalPage from "@/components/layout/LegalPage";

export const metadata = {
  title: "Terms of service",
  description:
    "Terms covering the IronVault Fitness demo: memberships, payments in test mode, account responsibilities and limitations.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    id: "demo",
    title: "This is a demonstration",
    body: [
      "IronVault Fitness is a fictional business created for a portfolio project. The website, prices, plans, facilities and coaching profiles are illustrative. No real gym services are sold and no real money is collected: payments run in Razorpay test mode.",
      "These terms describe how the demo application behaves. They are not legal advice and have not been reviewed by a lawyer.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    body: [
      "You must provide accurate details when registering and keep your password confidential. Accounts created here are demo accounts and may be removed when the demo environment is reset.",
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
      "This demo does not implement refunds. In a real deployment, refunds would be handled at the front desk and recorded against the original payment.",
    ],
  },
  {
    id: "conduct",
    title: "Using the facility",
    body: [
      "The facilities page lists illustrative floor rules: re-rack weights, wipe equipment, share racks between sets, and report damaged equipment to a coach.",
      "Age, medical and conduct policies are not implemented in this demo and would need to be added, along with local legal review, before operating a real gym.",
    ],
  },
  {
    id: "availability",
    title: "Availability and liability",
    body: [
      "The demo is provided as-is, for evaluation purposes, with no warranty of availability or fitness for a particular purpose. Features may be changed or reset at any time.",
      "Nothing on this site constitutes medical advice. Anyone starting a training program should consult a qualified professional, particularly with existing injuries or health conditions.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "Questions about these terms can go through the contact form, or to the address listed in the footer. Both are demo contact points.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="23 October 2026"
      intro="The rules that apply to this demonstration: what the plans are, how payments activate a membership and what is deliberately not implemented."
      sections={sections}
      footerNote="Demo notice: these terms are illustrative for a fictional business and are not a legally reviewed agreement."
    />
  );
}
