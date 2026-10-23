import PageIntro from '@/components/ui/PageIntro';
import FAQ from '@/components/ui/FAQ';
import {faqs} from '@/config/content';
export const metadata={title:'FAQ'};
export default function FAQPage(){return <div className="shell"><PageIntro label="FAQ" title="KNOW BEFORE YOU GO." text="Straight answers about this fictional gym, membership dates and the test payment workflow."/><FAQ items={faqs}/><div className="section-copy section"><p>Questions about a pending test purchase? Log in and use Check payment in your account. The backend verifies Razorpayâ€™s state before updating your access.</p></div></div>;}
