"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

/** Sets a password for an invited staff account, then signs in and redirects. */
export default function AcceptInviteForm({ token, email, redirectTo }) {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (values.name.trim().length < 2) next.name = "Enter your name";
    if (values.password.length < 8) next.password = "Use at least 8 characters";
    else if (!/[a-zA-Z]/.test(values.password) || !/[0-9]/.test(values.password))
      next.password = "Include at least one letter and one number";
    if (values.password !== values.confirmPassword) next.confirmPassword = "Passwords do not match";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...values }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setLoading(false);
        setErrors(data.fields || {});
        setFormError(data.error || "We could not activate this invitation.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password: values.password,
        redirect: false,
      });

      if (!result || result.error) {
        setLoading(false);
        setFormError("Account activated, but automatic sign-in failed. Please log in.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setLoading(false);
      setFormError("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <p className="field-label">Email</p>
        <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-ash">{email}</p>
      </div>

      <div>
        <label htmlFor="invite-name" className="field-label">
          Your name
        </label>
        <input
          id="invite-name"
          className={`field ${errors.name ? "field-error" : ""}`}
          value={values.name}
          onChange={onChange("name")}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          required
        />
        {errors.name ? <p className="error-text">{errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="invite-password" className="field-label">
          Choose a password
        </label>
        <input
          id="invite-password"
          type="password"
          className={`field ${errors.password ? "field-error" : ""}`}
          value={values.password}
          onChange={onChange("password")}
          autoComplete="new-password"
          aria-describedby="invite-password-hint"
          required
        />
        <p id="invite-password-hint" className="mt-1.5 text-[0.6875rem] text-ash">
          8+ characters, including a letter and a number.
        </p>
        {errors.password ? <p className="error-text">{errors.password}</p> : null}
      </div>

      <div>
        <label htmlFor="invite-confirm" className="field-label">
          Confirm password
        </label>
        <input
          id="invite-confirm"
          type="password"
          className={`field ${errors.confirmPassword ? "field-error" : ""}`}
          value={values.confirmPassword}
          onChange={onChange("confirmPassword")}
          autoComplete="new-password"
          required
        />
        {errors.confirmPassword ? <p className="error-text">{errors.confirmPassword}</p> : null}
      </div>

      {formError ? (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-sm text-red-100">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Activating…
          </>
        ) : (
          <>
            <ShieldCheck size={16} aria-hidden="true" /> Activate account
          </>
        )}
      </button>
    </form>
  );
}
