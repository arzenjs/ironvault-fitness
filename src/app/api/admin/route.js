import mongoose from 'mongoose';
import {z} from 'zod';
import {currentUser} from '@/lib/auth';
import {db} from '@/lib/db';
import {Membership,Payment,User,Audit} from '@/models';
import {invite} from '@/services/invitations';
import {endpoint,origin,body,SafeError} from '@/lib/security';
const input=z.discriminatedUnion('action',[
 z.object({action:z.literal('invite'),email:z.string().email().transform(s=>s.toLowerCase())}),
 z.object({action:z.literal('staff'),id:z.string(),enabled:z.boolean(),reason:z.string().trim().min(10).max(500)}),
 z.object({action:z.literal('access'),id:z.string(),suspended:z.boolean(),reason:z.string().trim().min(10).max(500)})
]);
export const POST=endpoint(async req=>{origin(req);const admin=await currentUser(['admin']);const data=input.parse(await body(req));if(data.action==='invite'){await invite(admin,data.email);return Response.json({ok:true,message:'Invitation saved; email delivery is queued.'});}if(!mongoose.isValidObjectId(data.id))throw new SafeError('Invalid record');const mongo=await db();const session=await mongo.startSession();try{await session.withTransaction(async()=>{if(data.action==='staff'){const user=await User.findOneAndUpdate({_id:data.id,role:'staff'},{$set:{enabled:data.enabled}},{session});if(!user)throw new SafeError('Staff account not found',404);}else{const m=await Membership.findOne({_id:data.id,state:'valid'}).session(session);if(!m||m.end<=new Date())throw new SafeError('Only paid, unexpired access may be changed');if(!await Payment.exists({_id:m.payment,status:'successful',processedAt:{$exists:true}}).session(session))throw new SafeError('Verified purchase required');await Membership.updateOne({_id:m._id},{$set:{suspended:data.suspended,reason:data.reason}},{session});}await Audit.create([{actor:admin._id,action:data.action,target:data.id,reason:data.reason}],{session});});}finally{await session.endSession();}return Response.json({ok:true});});
