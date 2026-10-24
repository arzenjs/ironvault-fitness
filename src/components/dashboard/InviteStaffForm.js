"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Send } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

/**
 * Admin-only staff invitation form.
 * The API creates a single-use, expiring hashed token and emails the link. When
 * email is not configured, the link is returned once so the admin can copy it.
 */
export default function InviteStaffForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setInviteUrl("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.fields?.email || data.error || "Could not create the invitation.");
        return;
      }
      setInviteUrl(data.inviteUrl);
      setEmail("");
      toast({
        tone: data.emailDelivered ? "success" : "info",
        title: data.emailDelivered ? "Invitation sent" : "Invitation created",
        description: data.emailDelivered
          ? "The invite email is on its way. The link expires in 48 hours."
          : "Email is not configured, so copy the link below and share it directly.",
      });
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_auto]">
        <div>
          <label htmlFor="invite-email" className="field-label">
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            className="field"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="colleague@ironvault.example"
            required
          />
        </div>
        <div>
          <label htmlFor="invite-role" className="field-label">
            Role
          </label>
          <select id="invite-role" className="field" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" aria-hidden="true" /> Sending…
              </>
            ) : (
              <>
                <Send size={14} aria-hidden="true" /> Invite
              </>
            )}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-100">
          {error}
        </p>
      ) : null}

      {inviteUrl ? (
        <div className="rounded-lg border border-white/15 bg-ink px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[0.6875rem] text-ash">
            <Mail size={12} aria-hidden="true" /> Invitation link (single use, expires in 48 hours):
          </p>
          <p className="mt-1 break-all font-mono text-[0.625rem] text-fog">{inviteUrl}</p>
        </div>
      ) : null}
    </form>
  );
}
