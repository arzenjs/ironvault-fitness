import {currentUser} from '@/lib/auth';
import {planInput} from '@/lib/validation';
import {createOrder} from '@/services/payments';
import {endpoint,origin,body,rate} from '@/lib/security';
export const POST=endpoint(async req=>{origin(req);const user=await currentUser(['customer']);await rate('order:'+user.id,8);const {planId,requestKey}=planInput.parse(await body(req));return Response.json(await createOrder(user,planId,requestKey));});
