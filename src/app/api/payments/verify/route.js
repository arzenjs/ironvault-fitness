import {currentUser} from '@/lib/auth';
import {Payment} from '@/models';
import {reconcile} from '@/services/payments';
import {endpoint,origin,body,rate,signature,SafeError} from '@/lib/security';
export const POST=endpoint(async req=>{origin(req);const user=await currentUser(['customer']);await rate('verify:'+user.id,30);const data=await body(req);const record=await Payment.findOne({user:user._id,orderId:data.razorpay_order_id});if(!record)throw new SafeError('Purchase not found',404);if(typeof data.razorpay_payment_id!=='string'||!signature(record.orderId+'|'+data.razorpay_payment_id,data.razorpay_signature,process.env.RAZORPAY_KEY_SECRET))throw new SafeError('Invalid payment signature',400);return Response.json({status:await reconcile(record,data.razorpay_payment_id)});});
