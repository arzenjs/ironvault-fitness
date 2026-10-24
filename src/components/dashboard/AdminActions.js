"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldOff, ShieldCheck, UserX, UserCheck, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

/**
 * Admin membership suspension / reinstatement.
 * A reason is mandatory and is stored in the audit trail with the actor.
 */
export function MembershipAction({ membershipId, suspended, label }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipId,
          action: suspended ? "reinstate" : "suspend",
          reason: reason || (suspended ? "Reinstated by admin" : ""),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast({
          tone: "error",
          title: "Action failed",
          description: data.fields?.reason || data.error || "Try again.",
        });
        return;
      }
      toast({
        tone: "success",
        title: suspended ? "Membership reinstated" : "Membership suspended",
        description: "The change and its reason were written to the audit log.",
      });
      setOpen(false);
      setReason("");
      router.refresh();
    } catch {
      toast({ tone: "error", title: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-sm whitespace-nowrap"
        aria-label={`${suspended ? "Reinstate" : "Suspend"} ${label}`}
      >
        {suspended ? <ShieldCheck size={13} aria-hidden="true" /> : <ShieldOff size={13} aria-hidden="true" />}
        {suspended ? "Reinstate" : "Suspend"}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 w-full rounded-lg border border-white/15 bg-ink p-3">
      <label htmlFor={`reason-${membershipId}`} className="field-label">
        Reason {suspended ? "(optional)" : "(required)"}
      </label>
      <input
        id={`reason-${membershipId}`}
        className="field"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder={suspended ? "Why is access being restored?" : "Why is access being suspended?"}
        required={!suspended}
        minLength={suspended ? 0 : 4}
        maxLength={300}
      />
      <div className="mt-2 flex gap-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : null}
          Confirm
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>
          <X size={13} aria-hidden="true" /> Cancel
        </button>
      </div>
    </form>
  );
}

/** Admin enable/disable for a staff or customer account. */
export function UserStatusAction({ userId, disabled, label }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const run = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: disabled ? "enable" : "disable",
          reason: disabled ? "Re-enabled by admin" : "Disabled by admin",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast({ tone: "error", title: "Action failed", description: data.error || "Try again." });
        return;
      }
      toast({ tone: "success", title: disabled ? "Account enabled" : "Account disabled", description: `${label} updated.` });
      router.refresh();
    } catch {
      toast({ tone: "error", title: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={run} disabled={loading} className="btn btn-ghost btn-sm whitespace-nowrap">
      {loading ? (
        <Loader2 size={13} className="animate-spin" aria-hidden="true" />
      ) : disabled ? (
        <UserCheck size={13} aria-hidden="true" />
      ) : (
        <UserX size={13} aria-hidden="true" />
      )}
      {disabled ? "Enable" : "Disable"}
    </button>
  );
}
