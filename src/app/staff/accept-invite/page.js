import Link from "next/link";
import { AlertTriangle, Clock3, XCircle } from "lucide-react";
import AcceptInviteForm from "@/components/auth/AcceptInviteForm";
import { findInvitationByToken } from "@/services/invitations";
import { connectDb, isDbConfigured } from "@/lib/db";

export const metadata = {
  title: "Accept staff invitation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const messages = {
  invalid: {
    icon: XCircle,
    title: "This invitation is not valid",
    body: "The link may be mistyped or belong to a different environment. Ask an administrator to send a new invitation.",
  },
  used: {
    icon: XCircle,
    title: "This invitation has already been used",
    body: "Each invitation is single-use. If you already activated your account, sign in instead. Otherwise request a new invitation.",
  },
  revoked: {
    icon: AlertTriangle,
    title: "This invitation was revoked",
    body: "An administrator cancelled this invitation, usually because a newer one was issued.",
  },
  expired: {
    icon: Clock3,
    title: "This invitation has expired",
    body: "Invitations stay valid for 48 hours. Ask an administrator to issue a fresh one.",
  },
};

export default async function AcceptInvitePage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";

  if (!isDbConfigured()) {
    return (
      <Shell>
        <p className="text-sm text-ash">
          The database is not configured in this environment, so invitations cannot be validated.
        </p>
      </Shell>
    );
  }

  await connectDb();
  const result = await findInvitationByToken(token);

  if (!result || result.state !== "valid") {
    const state = result?.state || "invalid";
    const info = messages[state] || messages.invalid;
    const Icon = info.icon;
    return (
      <Shell>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-300/35 bg-amber-300/10">
          <Icon size={20} className="text-amber-300" aria-hidden="true" />
        </span>
        <h1 className="display mt-5 text-[clamp(1.8rem,4vw,2.6rem)]">{info.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ash">{info.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="btn btn-primary btn-sm">
            Go to login
          </Link>
          <Link href="/contact" className="btn btn-outline btn-sm">
            Contact an admin
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="eyebrow">Staff invitation</p>
      <h1 className="display mt-3 text-[clamp(1.9rem,4vw,2.8rem)]">Activate your account</h1>
      <p className="mt-3 text-sm leading-relaxed text-ash">
        You have been invited as{" "}
        <span className="text-fog">{result.invitation.role === "admin" ? "an administrator" : "a staff member"}</span>{" "}
        for <span className="text-fog">{result.invitation.email}</span>. Set a password to finish. This link stops
        working once it is used.
      </p>
      <div className="mt-7">
        <AcceptInviteForm
          token={token}
          email={result.invitation.email}
          redirectTo={result.invitation.role === "admin" ? "/admin" : "/staff"}
        />
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <section className="flex min-h-screen items-center pt-24">
      <div className="shell">
        <div className="mx-auto max-w-md rounded-[1.3rem] border border-white/10 bg-coal p-6 md:p-8">{children}</div>
      </div>
    </section>
  );
}
