import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { getSessionUser } from "@/lib/session";
import { safeNextPath } from "@/lib/redirects";
import { media } from "@/config/media";

export const metadata = {
  title: "Create an account",
  description: "Create an IronVault account to buy a membership and track your plan.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const nextPath = safeNextPath(params?.next);
  const user = await getSessionUser();

  if (user) redirect(nextPath);

  return (
    <AuthShell
      title="Create your account"
      subtitle="One account for your membership, payment history and renewals. It takes under a minute."
      sideImage={media.hero.athlete}
    >
      <RegisterForm nextPath={nextPath} />
    </AuthShell>
  );
}
