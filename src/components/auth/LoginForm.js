"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { resolvePostLoginPath, safeNextPath } from "@/lib/redirects";

export default function LoginForm({ nextPath }) {
  const router = useRouter();
  // Only a validated, same-site path survives; null means "use the role's home".
  const requested = safeNextPath(nextPath, null);
  const [values, setValues] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");

  const onChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const nextErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email)) nextErrors.email = "Enter a valid email address";
    if (!values.password) nextErrors.password = "Enter your password";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setStatus("submitting");
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result || result.error) {
        setStatus("idle");
        setFormError("Email or password is incorrect, or the account is disabled.");
        return;
      }

      // The role comes from the freshly issued session, never from the URL.
      const session = await getSession();
      router.push(resolvePostLoginPath(session?.user?.role, requested));
      router.refresh();
    } catch {
      setStatus("idle");
      setFormError("We could not sign you in. Check your connection and try again.");
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={`field ${errors.email ? "field-error" : ""}`}
          value={values.email}
          onChange={onChange("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          placeholder="you@example.com"
          required
        />
        {errors.email ? (
          <p id="login-email-error" className="error-text">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className={`field pr-12 ${errors.password ? "field-error" : ""}`}
            value={values.password}
            onChange={onChange("password")}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            placeholder="Your password"
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
        {errors.password ? (
          <p id="login-password-error" className="error-text">
            {errors.password}
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
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Signing in…
          </>
        ) : (
          <>
            <LogIn size={16} aria-hidden="true" /> Sign in
          </>
        )}
      </button>

      <p className="pt-1 text-center text-xs text-ash">
        New here?{" "}
        <Link
          href={requested ? `/register?next=${encodeURIComponent(requested)}` : "/register"}
          className="font-medium text-fog underline decoration-signal/50 underline-offset-4 hover:text-signal"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
