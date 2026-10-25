"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

/**
 * Contact form.
 *
 * The browser only checks the obvious things for fast feedback; the API route
 * validates everything again with Zod and is the only thing that decides whether
 * a message was stored. Success is reported only after the server confirms it.
 */
export default function ContactForm() {
  const { toast } = useToast();
  const [values, setValues] = useState({ name: "", email: "", phone: "", topic: "general", message: "", company: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverMessage, setServerMessage] = useState("");

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    setServerMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setErrors(data.fields || {});
        setServerMessage(data.error || "We could not send your message. Please try again.");
        return;
      }

      setStatus("success");
      setValues({ name: "", email: "", phone: "", topic: "general", message: "", company: "" });
      toast({
        tone: "success",
        title: "Message sent",
        description: data.emailed
          ? "The front desk has been notified. We usually reply within one working day."
          : "Your message was received. Our team will get back to you as soon as possible.",
      });
    } catch {
      setStatus("error");
      setServerMessage("Network error — check your connection and try again.");
    }
  };

  const fieldClass = (field) => `field ${errors[field] ? "field-error" : ""}`;
  const describedBy = (field) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="card p-5 md:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className={fieldClass("name")}
            value={values.name}
            onChange={update("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            placeholder="Your full name"
            required
          />
          {errors.name ? (
            <p id="name-error" className="error-text">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={fieldClass("email")}
            value={values.email}
            onChange={update("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            placeholder="you@example.com"
            required
          />
          {errors.email ? (
            <p id="email-error" className="error-text">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="phone" className="field-label">
            Phone <span className="normal-case text-ash/60">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={fieldClass("phone")}
            value={values.phone}
            onChange={update("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone")}
            placeholder="+91 98765 43210"
          />
          {errors.phone ? (
            <p id="phone-error" className="error-text">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="topic" className="field-label">
            Topic
          </label>
          <select id="topic" name="topic" className="field" value={values.topic} onChange={update("topic")}>
            <option value="general">General enquiry</option>
            <option value="membership">Memberships</option>
            <option value="coaching">Coaching</option>
            <option value="billing">Billing or payments</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="field-label">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className={`${fieldClass("message")} resize-y`}
            value={values.message}
            onChange={update("message")}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describedBy("message")}
            placeholder="Tell us what you are looking for — training history, goals, or a question about a plan."
            required
          />
          {errors.message ? (
            <p id="message-error" className="error-text">
              {errors.message}
            </p>
          ) : null}
          <p className="mt-2 text-[0.6875rem] text-ash">Minimum 20 characters. Max 2,000.</p>
        </div>

        {/* Honeypot: hidden from users, catches naive bots. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={update("company")} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              <Send size={15} aria-hidden="true" /> Send message
            </>
          )}
        </button>
        <p className="text-[0.6875rem] leading-relaxed text-ash sm:max-w-[16rem]">
          We store your name, email and message to reply to you. See the privacy policy.
        </p>
      </div>

      <div aria-live="polite" className="mt-4">
        {status === "success" ? (
          <p className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2.5 text-sm text-emerald-100">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            Message sent. We will get back to you within one working day.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-sm text-red-100">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {serverMessage || "Something went wrong. Please try again."}
          </p>
        ) : null}
      </div>
    </form>
  );
}
