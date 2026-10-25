import MemberSearchForm from "@/components/dashboard/MemberSearchForm";
import MemberTable from "@/components/dashboard/MemberTable";
import { AdminPageHeader, SectionTitle } from "@/components/admin/AdminUI";
import { adminGuard } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { searchMembers } from "@/services/staff";

export const metadata = { title: "Members" };
export const dynamic = "force-dynamic";

export default async function AdminMembersPage({ searchParams }) {
  const guard = await adminGuard("/admin/members");
  if (guard.denied) return guard.denied;

  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.slice(0, 120) : "";
  const status = typeof params?.status === "string" ? params.status : "all";
  const planId = typeof params?.plan === "string" ? params.plan : "all";

  await connectDb();
  const { results, total, truncated } = await searchMembers({ query, status, planId, limit: 40 });

  return (
    <>
      <AdminPageHeader
        title="Member"
        accent="management"
        description="Search members, then suspend or reinstate a membership, or disable and re-enable the account. Every change needs a reason where required and is written to the audit log."
      />

      <div className="mt-8">
        <MemberSearchForm query={query} status={status} planId={planId} />
      </div>

      <section className="mt-8" aria-labelledby="members-heading">
        <SectionTitle id="members-heading" aside={`${total} match${total === 1 ? "" : "es"}${truncated ? " · showing first 40" : ""}`}>
          Member records
        </SectionTitle>
        <MemberTable members={results} admin />
      </section>
    </>
  );
}
