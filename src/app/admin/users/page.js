import { Search } from "lucide-react";
import { AdminPageHeader, EmptyState, FilterTabs, SectionTitle } from "@/components/admin/AdminUI";
import { MembershipBadge, RoleBadge } from "@/components/account/Badges";
import { UserStatusAction } from "@/components/dashboard/AdminActions";
import { adminGuard } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { listUsers } from "@/services/admin";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata = { title: "Accounts" };
export const dynamic = "force-dynamic";

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "customer", label: "Customers" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admins" },
];

export default async function AdminUsersPage({ searchParams }) {
  const guard = await adminGuard("/admin/users");
  if (guard.denied) return guard.denied;
  const admin = guard.user;

  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.slice(0, 120) : "";
  const role = typeof params?.role === "string" ? params.role : "all";
  const status = typeof params?.status === "string" ? params.status : "all";

  await connectDb();
  const { users, total, truncated } = await listUsers({ query, role, status });

  return (
    <>
      <AdminPageHeader
        title="User"
        accent="accounts"
        description="Activate or deactivate any account. Disabled accounts cannot sign in and lose access on their next request. You cannot change your own account, and the last active admin is protected."
      />

      <form method="GET" role="search" className="card mt-8 grid gap-3 p-4 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] md:p-5">
        <div>
          <label htmlFor="user-q" className="field-label">
            Search
          </label>
          <input id="user-q" name="q" type="search" defaultValue={query} placeholder="Name, email or phone" className="field" />
        </div>
        <div>
          <label htmlFor="user-status" className="field-label">
            Status
          </label>
          <select id="user-status" name="status" defaultValue={status} className="field">
            <option value="all">Any status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        {role !== "all" ? <input type="hidden" name="role" value={role} /> : null}
        <div className="flex items-end">
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            <Search size={15} aria-hidden="true" /> Search
          </button>
        </div>
      </form>

      <div className="mt-4">
        <FilterTabs basePath="/admin/users" param="role" current={role} options={roleOptions} extra={{ q: query, status: status !== "all" ? status : "" }} />
      </div>

      <section className="mt-6" aria-labelledby="accounts-heading">
        <SectionTitle id="accounts-heading" aside={`${total} account${total === 1 ? "" : "s"}${truncated ? ` · showing first ${users.length}` : ""}`}>
          Accounts
        </SectionTitle>
        {users.length ? (
          <ul className="space-y-2">
            {users.map((account) => {
              const id = account._id.toString();
              const isSelf = id === admin.id;
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-coal px-4 py-3"
                >
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-fog">
                      <span className="truncate">{account.name}</span>
                      <RoleBadge role={account.role} />
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ash">{account.email}</p>
                    <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ash/80">
                      Joined {formatDate(account.createdAt)} · Last sign-in {account.lastLoginAt ? formatDateTime(account.lastLoginAt) : "never"}
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
                    <MembershipBadge state={account.status === "active" ? "active" : "suspended"} label={account.status} />
                    {isSelf ? (
                      <span className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-ash">you</span>
                    ) : (
                      <UserStatusAction userId={id} disabled={account.status === "disabled"} label={account.email} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState>No accounts match these filters.</EmptyState>
        )}
      </section>
    </>
  );
}
