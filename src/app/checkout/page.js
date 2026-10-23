import {redirect,notFound} from 'next/navigation';
import {currentUser} from '@/lib/auth';
import {getPlan} from '@/config/membership-plans';
import Checkout from '@/components/memberships/Checkout';
import PageIntro from '@/components/ui/PageIntro';
export const dynamic='force-dynamic';
export const metadata={title:'Checkout',robots:{index:false,follow:false}};
export default async function CheckoutPage({searchParams}){const {plan:id}=await searchParams;const plan=getPlan(id);if(!plan)notFound();let user;try{user=await currentUser(['customer']);}catch(e){if(e.status===401)redirect('/login?plan='+plan.id);throw e;}return <div className="shell"><PageIntro label="SECURE CHECKOUT" title="MAKE IT A ROUTINE." text="Your plan price is retrieved on the server. Access is activated only after verified Razorpay capture."/><Checkout plan={plan} user={{name:user.name,email:user.email}}/></div>;}
