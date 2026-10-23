import {accept} from '@/services/invitations';
import {registration} from '@/lib/validation';
import {endpoint,origin,body,rate} from '@/lib/security';
export const POST=endpoint(async req=>{origin(req);const data=await body(req);const account=registration.parse(data);await rate('invite:'+account.email,8);await accept(data.token,account);return Response.json({ok:true});});
