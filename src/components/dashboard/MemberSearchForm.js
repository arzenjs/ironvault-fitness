import { Search } from "lucide-react";
import { membershipPlans } from "@/config/membership-plans";

/**
 * Plain GET form — the staff search works without JavaScript, and the query
 * lives in the URL so results can be bookmarked or shared.
 */
export default function MemberSearchForm({ query = "", status = "all", planId = "all" }) {
  return (
    <form method="GET" className="card p-4 md:p-5" role="search">
      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="member-q" className="field-label">
            Search
          </label>
          <input
            id="member-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Name, email or phone"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="member-status" className="field-label">
            Membership
          </label>
          <select id="member-status" name="status" defaultValue={status} className="field">
            <option value="all">Any state</option>
            <option value="active">Active</option>
            <option value="queued">Queued</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
            <option value="none">No membership</option>
          </select>
        </div>
        <div>
          <label htmlFor="member-plan" className="field-label">
            Plan
          </label>
          <select id="member-plan" name="plan" defaultValue={planId} className="field">
            <option value="all">Any plan</option>
            {membershipPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            <Search size={15} aria-hidden="true" /> Search
          </button>
        </div>
      </div>
    </form>
  );
}
