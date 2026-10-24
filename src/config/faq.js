/** FAQ content, grouped by category. Used by both the homepage preview and /faq. */
export const faqCategories = [
  {
    id: "membership",
    label: "Membership",
    items: [
      {
        q: "What is included in a membership?",
        a: "Every plan includes gym-floor access during opening hours, use of the strength, resistance and cardio equipment, locker access and a standard orientation. Quarterly and annual plans add fitness assessments and priority access to selected group sessions — the exact list is on the memberships page.",
      },
      {
        q: "Can I buy a membership online?",
        a: "Yes. Choose a plan, create an account if you do not have one, and pay through Razorpay's hosted checkout. Nothing is charged on this site directly — Razorpay handles the payment page and this app never sees your card details.",
      },
      {
        q: "What happens if I buy a second plan while mine is still active?",
        a: "The new plan is queued and starts the day after your current membership expires, so no paid days are lost. Your account dashboard shows both the active and the queued membership with their exact dates.",
      },
      {
        q: "Does my membership renew automatically?",
        a: "No. Plans are one-time, fixed-duration purchases. There is no auto-debit and no stored payment method — you choose when to renew from your account.",
      },
      {
        q: "Can I transfer or pause my membership?",
        a: "Pauses and transfers are handled in person at the front desk on a case-by-case basis. This demo site does not implement pause or transfer requests.",
      },
    ],
  },
  {
    id: "payments",
    label: "Payments & receipts",
    items: [
      {
        q: "Which payment methods can I use?",
        a: "Razorpay's test-mode checkout accepts UPI, cards, net banking and wallets. In test mode you use Razorpay's test credentials — no real money moves.",
      },
      {
        q: "My payment succeeded but my membership is not active yet. What now?",
        a: "Membership activation depends on a verified server-side confirmation from Razorpay, which can lag a few seconds behind the checkout window. Your payment page keeps checking and will update automatically. If it still shows pending after a minute, contact the front desk with your payment reference.",
      },
      {
        q: "Do I get an email receipt?",
        a: "A confirmation email is sent to your registered address after the payment is verified and the membership is activated. If email delivery fails, the membership is still valid and the record stays visible in your account.",
      },
      {
        q: "What if my payment fails?",
        a: "Failed payments never activate a membership. The payment appears in your history with a failed status and you can retry from the memberships page.",
      },
    ],
  },
  {
    id: "facility",
    label: "The gym",
    items: [
      {
        q: "What are your opening hours?",
        a: "Monday to Saturday, 5:30 AM to 10:00 PM. Sunday, 7:00 AM to 12:00 PM (open gym only). Holiday hours are posted at the front desk.",
      },
      {
        q: "Do you provide towels and toiletries?",
        a: "Showers and changing rooms are available. Towels are not provided in this demo's listed facilities — bring your own and a padlock if you want a fixed locker.",
      },
      {
        q: "Is there parking?",
        a: "Street parking is available along Fraser Road with limited two-wheeler space at the entrance. This is demo content — confirm with the actual facility before relying on it.",
      },
      {
        q: "I am new to the gym. Will someone show me around?",
        a: "Yes. Every plan includes a standard orientation where a coach walks you through the floor, the equipment and the safety rules, and helps you pick a starting point.",
      },
    ],
  },
  {
    id: "account",
    label: "Account & privacy",
    items: [
      {
        q: "What information do you store?",
        a: "Your name, email, a securely hashed password, and your membership and payment records. Card data is never stored here — Razorpay's checkout collects it on their infrastructure. See the privacy policy for the full list.",
      },
      {
        q: "Can I delete my account?",
        a: "This demo does not include self-service deletion. Account removal is described in the privacy policy as a manual request to the front desk.",
      },
      {
        q: "Who can see my payment history?",
        a: "Only you, using the account dashboard, and authorised staff who need to help with billing questions. Every account route and API checks ownership or role on the server.",
      },
    ],
  },
];

/** Flat list used for the homepage FAQ preview. */
export const faqPreview = faqCategories.flatMap((category) =>
  category.items.slice(0, category.id === "membership" ? 2 : 1).map((item) => ({
    ...item,
    category: category.label,
  })),
);
