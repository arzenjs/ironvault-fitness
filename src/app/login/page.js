import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { getSessionUser } from "@/lib/session";
import { safeNextPath } from "@/lib/redirects";
import { media } from "@/config/media";

export const metadata = {
  title: "Log in",
  description: "Sign in to view your IronVault membership, plan dates and payment history.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const nextPath = safeNextPath(params?.next);
  const user = await getSessionUser();

  // Already signed in → continue to the intended destination.
  if (user) redirect(nextPath);

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
