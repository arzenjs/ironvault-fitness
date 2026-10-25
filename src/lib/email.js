import { Resend } from "resend";
import { gym } from "@/config/gym";
import { formatDate, formatINR } from "@/lib/format";
import { isRazorpayTestMode } from "@/lib/razorpay";

/**
 * Transactional email via Resend.
 *
 * If RESEND_API_KEY is not set the app logs a warning and moves on: email is
 * never allowed to block or reverse a verified payment. Failures are recorded
 * on the payment record (emailError) so they can be retried.
 */

let client = null;

/**
 * Business addresses (see src/config/gym.js for what each one is for).
 * Environment variables override the config defaults on the server. There is
 * deliberately no fallback from one to the other: customer mail must never be
 * routed to the staff-invitation address, nor invitations to the public inbox.
 */
export function getContactInbox() {
  return (process.env.CONTACT_INBOX_EMAIL || gym.contactEmail || "").trim() || null;
}

export function getStaffInviteAddress() {
  return (process.env.STAFF_INVITE_EMAIL || gym.staffInviteEmail || "").trim() || null;
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

function getClient() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!isEmailConfigured()) {
    console.warn(`[email] skipped "${subject}" — RESEND_API_KEY / RESEND_FROM_EMAIL not configured.`);
    return { ok: false, skipped: true };
  }
  try {
    const { data, error } = await getClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error("[email] Resend error:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (error) {
    console.error("[email] send failed:", error?.message);
    return { ok: false, error: error?.message || "send_failed" };
  }
}

/* ------------------------------------------------------------------ */
/*  Templates                                                          */
/* ------------------------------------------------------------------ */

function layout({ heading, intro, body, footerNote, paymentNote }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${heading}</title></head>
<body style="margin:0;padding:0;background:#070709;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f5f5f3;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070709;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0b0b0f;border:1px solid #1b1b23;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 8px;">
          <div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#e5231b;font-weight:700;">IRONVAULT FITNESS</div>
        </td></tr>
        <tr><td style="padding:8px 32px 0;">
          <h1 style="margin:8px 0 12px;font-size:28px;line-height:1.15;letter-spacing:-0.01em;color:#f5f5f3;">${heading}</h1>
          ${intro ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#b9b9c2;">${intro}</p>` : ""}
        </td></tr>
        <tr><td style="padding:0 32px 24px;font-size:14px;line-height:1.65;color:#d3d3d8;">${body}</td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #1b1b23;font-size:12px;line-height:1.6;color:#82828d;">
          ${footerNote || `Questions? Reply to this email or call ${gym.phone}.<br>${gym.address.full}`}
          ${paymentNote ? `<br><br><span style="color:#5f5f69;">${paymentNote}</span>` : ""}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailRow(label, value) {
  return `<tr>
    <td style="padding:6px 0;color:#82828d;font-size:13px;">${label}</td>
    <td style="padding:6px 0;color:#f5f5f3;font-size:13px;text-align:right;font-weight:600;">${value}</td>
  </tr>`;
}

export async function sendMembershipConfirmation({ payment, membership }) {
  if (!payment || !membership) return { ok: false, skipped: true };

  const rows = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111117;border:1px solid #26262f;border-radius:12px;padding:8px 16px;margin:0 0 20px;">
      ${detailRow("Plan", membership.planName)}
      ${detailRow("Amount paid", formatINR(payment.amountPaise))}
      ${detailRow("Valid from", formatDate(membership.startDate))}
      ${detailRow("Valid until", formatDate(membership.endDate))}
      ${detailRow("Payment reference", payment.razorpayPaymentId || "—")}
    </table>`;

  const html = layout({
    heading: "Your membership is active",
    intro: `Hi ${payment.customerName || "there"} — your payment was verified and your IronVault membership is ready to use.`,
    paymentNote: isRazorpayTestMode()
      ? "This payment was made in Razorpay test mode. No real money was charged."
      : "",
    body: `${rows}
      <p style="margin:0 0 12px;">Bring this email or your account dashboard to the front desk on your first visit. A coach will walk you through the floor and set up your orientation.</p>
      <p style="margin:0;"><strong style="color:#f5f5f3;">Opening hours:</strong> ${gym.hours[0].days}, ${gym.hours[0].opens}–${gym.hours[0].closes} · ${gym.hours[1].days}, ${gym.hours[1].opens}–${gym.hours[1].closes}</p>`,
  });

  const text = `Your IronVault Fitness membership is active.\n\nPlan: ${membership.planName}\nAmount: ${formatINR(payment.amountPaise)}\nValid from: ${formatDate(membership.startDate)}\nValid until: ${formatDate(membership.endDate)}\nPayment reference: ${payment.razorpayPaymentId || "—"}\n\n${gym.address.full} · ${gym.phone}`;

  return sendEmail({
    to: payment.customerEmail,
    subject: `Membership confirmed — ${membership.planName}`,
    html,
    text,
    replyTo: getContactInbox() || undefined,
  });
}

export async function sendWelcomeEmail({ name, email }) {
  const html = layout({
    heading: "Welcome to IronVault",
    intro: `Hi ${name}, your account is ready.`,
    body: `<p style="margin:0 0 12px;">You can choose a membership from the plans page whenever you are ready. Nothing is charged until you complete a payment through Razorpay's checkout.</p>
      <p style="margin:0;">Your dashboard keeps your membership dates, payment history and plan details in one place.</p>`,
  });
  return sendEmail({
    to: email,
    subject: "Your IronVault account is ready",
    html,
    replyTo: getContactInbox() || undefined,
  });
}

export async function sendStaffInvitation({ email, inviteUrl, inviterName, role }) {
  const html = layout({
    heading: "You have been invited to the IronVault portal",
    intro: `${inviterName} invited you as ${role === "admin" ? "an administrator" : "a staff member"}.`,
    body: `<p style="margin:0 0 18px;">Set your password to activate the account. This link is single-use and expires in 48 hours.</p>
      <p style="margin:0 0 18px;"><a href="${inviteUrl}" style="display:inline-block;background:#e5231b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px;">Accept invitation</a></p>
      <p style="margin:0;font-size:12px;color:#82828d;word-break:break-all;">${inviteUrl}</p>`,
    footerNote: "If you were not expecting this invitation, you can ignore this email.",
  });
  return sendEmail({
    to: email,
    subject: "Your IronVault staff invitation",
    html,
    text: `You have been invited to IronVault Fitness staff portal. Accept: ${inviteUrl} (single-use, expires in 48 hours).`,
    // Replies go to the staff/admin invitation address — never the public contact inbox.
    replyTo: getStaffInviteAddress() || undefined,
  });
}

export async function sendContactNotification({ name, email, phone, topic, message }) {
  const inbox = getContactInbox();
  if (!inbox) {
    console.warn("[email] contact notification skipped — no contact inbox configured (gym.contactEmail / CONTACT_INBOX_EMAIL).");
    return { ok: false, skipped: true };
  }
  const html = layout({
    heading: "New contact form message",
    intro: `${name} (${email}) wrote about ${topic}.`,
    body: `<p style="margin:0 0 12px;white-space:pre-wrap;">${escapeHtml(message)}</p>
      <p style="margin:0;font-size:13px;color:#82828d;">Phone: ${escapeHtml(phone || "not provided")}</p>`,
  });
  return sendEmail({
    to: inbox,
    subject: `Contact form — ${topic} — ${name}`,
    html,
    text: `${name} <${email}> (${phone || "no phone"})\nTopic: ${topic}\n\n${message}`,
    replyTo: email,
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
