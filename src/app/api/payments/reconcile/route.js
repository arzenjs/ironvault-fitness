import mongoose from 'mongoose';
import {currentUser} from '@/lib/auth';
import {Payment} from '@/models';
import {reconcile} from '@/services/payments';
import {endpoint,origin,body,rate,SafeError} from '@/lib/security';
export const POST=endpoint(async req=>{origin(req);const user=await currentUser();await rate('reconcile:'+user.id,30);const {purchaseId}=await body(req);if(!mongoose.isValidObjectId(purchaseId))throw new SafeError('Invalid purchase');const filter={_id:purchaseId};if(user.role==='customer')filter.user=user._id;const record=await Payment.findOne(filter);if(!record)throw new SafeError('Purchase not found',404);return Response.json({status:await reconcile(record)});});
