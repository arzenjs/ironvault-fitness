import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { getSessionUser } from "@/lib/session";
import { resolvePostLoginPath, safeNextPath } from "@/lib/redirects";
import { media } from "@/config/media";

export const metadata = {
  title: "Log in",
  description: "Sign in to view your IronVault membership, plan dates and payment history.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  // `null` when no (valid) destination was requested; the role then decides where to land.
  const nextPath = safeNextPath(params?.next, null);
  const user = await getSessionUser();

  // Already signed in → continue to the requested page, or the role's own home.
  if (user) redirect(resolvePostLoginPath(user.role, nextPath));

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your membership dates, payment history and renewal options."
      sideImage={media.about.barbell}
    >
      <LoginForm nextPath={nextPath} />
    </AuthShell>
  );
}
