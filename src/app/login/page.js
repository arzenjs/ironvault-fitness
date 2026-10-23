import Link from 'next/link';
import Forms from '@/components/ui/Forms';
import PageIntro from '@/components/ui/PageIntro';
import {getPlan} from '@/config/membership-plans';
export const metadata={title:"Login"};
export default async function AuthPage({searchParams}){const params=await searchParams;const plan=getPlan(params.plan)?.id||'';return <div className="shell auth-page"><PageIntro label="YOUR ACCOUNT" title="WELCOME BACK." text="Use a test account for this fictional portfolio. A selected membership is preserved through authentication."/><Forms mode="login" plan={plan}/><p><Link className="text-link" href={'/register?plan='+plan}>Create an account â†—</Link></p></div>;}
