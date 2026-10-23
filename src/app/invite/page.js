import Forms from '@/components/ui/Forms';
import PageIntro from '@/components/ui/PageIntro';
export const metadata={title:'Staff invitation',robots:{index:false,follow:false}};
export default async function Invite({searchParams}){const {token}=await searchParams;return <div className="shell auth-page"><PageIntro label="STAFF INVITATION" title="JOIN THE TEAM." text="Use the email address that received this invitation. Links expire after 24 hours and can be used only once."/>{typeof token==='string'&&/^[a-f0-9]{64}$/.test(token)?<Forms mode="invite" token={token}/>:<p role="alert">This invitation link is invalid.</p>}</div>;}
