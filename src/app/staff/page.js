import {pageUser} from '@/lib/page-auth';
import MemberDirectory from '@/components/dashboard/MemberDirectory';
import {Logout} from '@/components/account/AccountActions';
export const dynamic='force-dynamic';
export const metadata={title:'Staff portal',robots:{index:false,follow:false}};
export default async function Staff({searchParams}){await pageUser(['staff','admin']);const params=await searchParams;return <div className="shell dashboard"><div className="section-heading"><div><span className="eyebrow">OPERATIONS / STAFF</span><h1>MEMBER DESK.</h1><p>Read-only membership visibility and provider reconciliation. Payment amounts and roles cannot be changed here.</p></div><Logout/></div><MemberDirectory params={params}/></div>;}
