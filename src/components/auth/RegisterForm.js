"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AlertCircle, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { resolvePostLoginPath, safeNextPath } from "@/lib/redirects";

/**
 * Registration → immediate sign-in → continue to the original destination
 * (for example the checkout page the visitor came from).
 */
export default function RegisterForm({ nextPath }) {
  const router = useRouter();
  // Public registration only ever creates customers, so staff/admin destinations are ignored.
  const target = resolvePostLoginPath("customer", safeNextPath(nextPath, null));
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");

  const onChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email address";
    if (values.password.length < 8) next.password = "Use at least 8 characters";
    else if (!/[a-zA-Z]/.test(values.password) || !/[0-9]/.test(values.password))
      next.password = "Include at least one letter and one number";
    if (values.password !== values.confirmPassword) next.confirmPassword = "Passwords do not match";
    return next;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("idle");
        setErrors(data.fields || {});
        setFormError(data.error || "We could not create your account.");
        return;
      }

      // Account created — sign in automatically with the same credentials.
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result || result.error) {
        setStatus("idle");
        setFormError("Account created, but automatic sign-in failed. Please log in.");
        return;
      }

      router.push(target);
      router.refresh();
    } catch {
      setStatus("idle");
      setFormError("Network error — check your connection and try again.");
    }
  };

  const fieldClass = (field) => `field ${errors[field] ? "field-error" : ""}`;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="name" className="field-label">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className={fieldClass("name")}
          value={values.name}
          onChange={onChange("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "reg-name-error" : undefined}
          placeholder="Your name"
          required
        />
        {errors.name ? (
          <p id="reg-name-error" className="error-text">
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
          type="email"
          autoComplete="email"
          className={fieldClass("email")}
          value={values.email}
          onChange={onChange("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "reg-email-error" : undefined}
          placeholder="you@example.com"
          required
        />
        {errors.email ? (
          <p id="reg-email-error" className="error-text">
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
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={fieldClass("phone")}
          value={values.phone}
          onChange={onChange("phone")}
          placeholder="+91 98765 43210"
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={`${fieldClass("password")} pr-12`}
            value={values.password}
            onChange={onChange("password")}
            aria-invalid={Boolean(errors.password)}
            aria-describedby="reg-password-hint"
            placeholder="8+ characters, letters and numbers"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-ash transition hover:text-fog"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p id="reg-password-hint" className="mt-1.5 text-[0.6875rem] text-ash">
          At least 8 characters, including a letter and a number.
        </p>
        {errors.password ? <p className="error-text">{errors.password}</p> : null}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="field-label">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          className={fieldClass("confirmPassword")}
          value={values.confirmPassword}
          onChange={onChange("confirmPassword")}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? "reg-confirm-error" : undefined}
          placeholder="Repeat your password"
          required
        />
        {errors.confirmPassword ? (
          <p id="reg-confirm-error" className="error-text">
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-sm text-red-100">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary w-full" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Creating account…
          </>
        ) : (
          <>
            <UserPlus size={16} aria-hidden="true" /> Create account
          </>
        )}
      </button>

      <p className="pt-1 text-center text-xs text-ash">
        Already have an account?{" "}
        <Link
          href={target === "/account" ? "/login" : `/login?next=${encodeURIComponent(target)}`}
          className="font-medium text-fog underline decoration-signal/50 underline-offset-4 hover:text-signal"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
