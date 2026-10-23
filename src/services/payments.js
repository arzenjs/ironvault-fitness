import {db} from '../lib/db.js';
import {provider} from '../lib/razorpay.js';
import {Payment,Membership,User,indexes} from '../models/index.js';
import {getPlan} from '../config/membership-plans.js';
import {SafeError} from '../lib/security.js';
import {addMonths,validCapture} from './memberships.js';
import {queueMail,deliverMail} from '../lib/email.js';
export async function createOrder(user,planId,requestKey){
 const plan=getPlan(planId);if(!plan)throw new SafeError('Unknown membership');
 const mongo=await db();await indexes();const api=provider();
 let previous=await Payment.findOne({user:user._id,requestKey});
 if(previous){if(previous.planId!==planId)throw new SafeError('Purchase request does not match plan',409);if(!previous.orderId){await reconcile(previous);previous=await Payment.findById(previous._id);}if(previous.status==='successful')throw new SafeError('This purchase is already paid. Open your account.',409);if(!previous.orderId)throw new SafeError('Order confirmation pending. Check your account before retrying.',409);return {purchaseId:String(previous._id),orderId:previous.orderId,amount:previous.amount,currency:'INR',key:process.env.RAZORPAY_KEY_ID};}
 const session=await mongo.startSession();let record;
 try{await session.withTransaction(async()=>{const rows=await Payment.create([{user:user._id,planId,requestKey,amount:plan.pricePaise,currency:'INR'}],{session});record=rows[0];await Membership.create([{user:user._id,payment:record._id,planId}],{session});});}
 finally{await session.endSession();}
 try{const order=await api.orders.create({amount:record.amount,currency:'INR',receipt:String(record._id),notes:{purchaseId:String(record._id)}});await Payment.updateOne({_id:record._id},{$set:{orderId:order.id}});return {purchaseId:String(record._id),orderId:order.id,amount:record.amount,currency:'INR',key:process.env.RAZORPAY_KEY_ID};}
 catch(e){await Payment.updateOne({_id:record._id},{$set:{creationError:true}});throw e;}
}
// External provider verification happens BEFORE the MongoDB transaction.
export async function reconcile(record,paymentId){
 const api=provider();
 if(!record.orderId){const orders=await api.orders.all({receipt:String(record._id),count:100});const matches=orders.items.filter(o=>o.receipt===String(record._id)&&o.amount===record.amount&&o.currency===record.currency);if(matches.length!==1)return 'pending';record=await Payment.findOneAndUpdate({_id:record._id},{$set:{orderId:matches[0].id}},{new:true});}
 const order=await api.orders.fetch(record.orderId);
 if(order.amount!==record.amount||order.currency!==record.currency||order.receipt!==String(record._id))throw new SafeError('Provider order mismatch',409);
 let payments;
 if(paymentId)payments=[await api.payments.fetch(paymentId)];else payments=(await api.orders.fetchPayments(record.orderId)).items;
 const captured=payments.find(p=>validCapture(p,record));
 if(!captured){const authorized=payments.some(p=>p.status==='authorized');const failed=payments.length>0&&payments.every(p=>p.status==='failed');const status=authorized?'pending':failed?'failed':Date.now()-record.createdAt.getTime()>86400000?'abandoned':'pending';await Payment.updateOne({_id:record._id,status:{$ne:'successful'}},{$set:{status,lastAttemptStatus:authorized?'authorized':failed?'failed':'not completed'}});return status;}
 const mongo=await db();const session=await mongo.startSession();
 try{await session.withTransaction(async()=>{
  const payment=await Payment.findById(record._id).session(session);if(payment.status==='successful'&&payment.processedAt)return;
  // Every activation writes the same user document: concurrent purchases conflict
  // and MongoDB retries the transaction before calculating the queued period.
  const user=await User.findOneAndUpdate({_id:payment.user},{$inc:{scheduleVersion:1}},{session,new:true});if(!user)throw Error('Purchase owner missing');
  const latest=await Membership.findOne({user:payment.user,state:'valid'}).sort({end:-1}).session(session);
  const now=new Date();const start=latest?.end>now?latest.end:now;const end=addMonths(start,getPlan(payment.planId).months);
  const membership=await Membership.findOneAndUpdate({payment:payment._id},{$set:{state:'valid',start,end}},{session,new:true});if(!membership)throw Error('Pending membership missing');
  await Payment.updateOne({_id:payment._id},{$set:{status:'successful',paymentId:captured.id,processedAt:now}},{session});
  await queueMail({key:'membership-'+String(payment._id),to:user.email,subject:'IronVault â€” membership confirmed (test)',text:`IronVault Fitness\nYour test-mode ${getPlan(payment.planId).name} purchase is verified.\nStarts: ${start.toISOString()}\nEnds (exclusive): ${end.toISOString()}\nPayment reference: ${captured.id}\nNo real gym access is provided by this fictional demo.`},session);
 });}finally{await session.endSession();}
 await deliverMail('membership-'+String(record._id));return 'successful';
}
