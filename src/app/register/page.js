import Link from 'next/link';
import Forms from '@/components/ui/Forms';
import PageIntro from '@/components/ui/PageIntro';
import {getPlan} from '@/config/membership-plans';
export const metadata={title:"Register"};
export default async function AuthPage({searchParams}){const params=await searchParams;const plan=getPlan(params.plan)?.id||'';return <div className="shell auth-page"><PageIntro label="YOUR ACCOUNT" title="YOUR NEXT CHAPTER." text="Use a test account for this fictional portfolio. A selected membership is preserved through authentication."/><Forms mode="register" plan={plan}/><p><Link className="text-link" href={'/login?plan='+plan}>Already registered? Log in â†—</Link></p></div>;}
