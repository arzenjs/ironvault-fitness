import Link from "next/link";
import { Mail } from "lucide-react";
import { AdminPageHeader, EmptyState, SectionTitle } from "@/components/admin/AdminUI";
import { MembershipBadge, RoleBadge } from "@/components/account/Badges";
import InviteStaffForm from "@/components/dashboard/InviteStaffForm";
import { UserStatusAction } from "@/components/dashboard/AdminActions";
import { adminGuard } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { getStaffInviteAddress, isEmailConfigured } from "@/lib/email";
import { listInvitations, listUsers } from "@/services/admin";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Staff & invitations" };
export const dynamic = "force-dynamic";

const stateTone = {
  open: "text-emerald-300",
  used: "text-ash",
  expired: "text-amber-200/80",
  revoked: "text-red-200/80",
};

export default async function AdminStaffPage() {
  const guard = await adminGuard("/admin/staff");
  if (guard.denied) return guard.denied;
  const admin = guard.user;

  await connectDb();
  const [invitations, staffResult, adminResult] = await Promise.all([
    listInvitations(30),
    listUsers({ role: "staff", limit: 100 }),
    listUsers({ role: "admin", limit: 100 }),
  ]);
  const team = [...adminResult.users, ...staffResult.users];
  const emailReady = isEmailConfigured();
  const replyTo = getStaffInviteAddress();

  return (
    <>
      <AdminPageHeader
        title="Staff &"
        accent="invitations"
        description="Staff and administrator accounts can only be created through a single-use invitation. There is no public staff or admin registration."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="invite-heading" className="card p-5">
          <h2 id="invite-heading" className="flex items-center gap-2 text-sm font-semibold text-fog">
            <Mail size={14} className="text-signal" aria-hidden="true" /> Invite staff
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ash">
            Invitations are single-use and expire after 48 hours. Only the hash of the token is stored.
          </p>
          <div className="mt-4">
            <InviteStaffForm />
          </div>
          <p className="mt-5 rounded-lg border border-white/10 bg-ink px-3 py-2.5 text-[0.6875rem] leading-relaxed text-ash">
            {emailReady
              ? "Invitation emails are sent through Resend."
              : "Email delivery is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL): the invitation link is shown once after you create it, so you can share it yourself."}{" "}
            {replyTo ? (
              <>
                Replies go to <span className="text-fog/90">{replyTo}</span>.
              </>
            ) : (
              "No reply-to address is configured for invitations."
            )}
          </p>
        </section>

        <section aria-labelledby="invitations-heading">
          <SectionTitle id="invitations-heading" aside={`${invitations.length} shown`}>
            Invitation status
          </SectionTitle>
          {invitations.length ? (
            <ul className="divide-y divide-white/[0.07] rounded-xl border border-white/10 bg-coal">
              {invitations.map((invitation) => (
                <li key={invitation._id.toString()} className="px-4 py-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm text-fog">{invitation.email}</span>
                    <span className="flex items-center gap-2">
                      <RoleBadge role={invitation.role} />
                      <span className={`font-mono text-[0.5625rem] uppercase tracking-[0.12em] ${stateTone[invitation.state]}`}>
                        {invitation.state}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[0.5625rem] text-ash">
                    Sent {formatDateTime(invitation.createdAt)}
                    {invitation.inviter ? ` by ${invitation.inviter.email}` : ""}
                    {invitation.state === "open" ? ` · expires ${formatDateTime(invitation.expiresAt)}` : ""}
                    {invitation.usedAt ? ` · accepted ${formatDateTime(invitation.usedAt)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No invitations yet.</EmptyState>
          )}
        </section>
      </div>

      <section className="mt-10" aria-labelledby="team-heading">
        <SectionTitle
          id="team-heading"
          aside={
            <Link href="/admin/users?role=staff" className="hover:text-fog">
              Manage all accounts →
            </Link>
          }
        >
          Staff and admin accounts
        </SectionTitle>
        {team.length ? (
          <ul className="space-y-2">
            {team.map((member) => {
              const id = member._id.toString();
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-coal px-4 py-3"
                >
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="truncate text-sm font-medium text-fog">{member.name}</p>
                    <p className="truncate text-xs text-ash">{member.email}</p>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
                    <RoleBadge role={member.role} />
                    <MembershipBadge state={member.status === "active" ? "active" : "suspended"} label={member.status} />
                    {id === admin.id ? (
                      <span className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-ash">you</span>
                    ) : (
                      <UserStatusAction userId={id} disabled={member.status === "disabled"} label={member.email} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState>No staff accounts yet.</EmptyState>
        )}
      </section>
    </>
  );
}
