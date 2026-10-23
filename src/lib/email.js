import {Resend} from 'resend';
import {Mail} from '../models/index.js';
export async function queueMail(data,session){return Mail.updateOne({key:data.key},{$setOnInsert:data},{upsert:true,session});}
export async function deliverMail(key){
 const filter={status:'pending',$or:[{lockedUntil:{$exists:false}},{lockedUntil:{$lt:new Date()}}]};if(key)filter.key=key;
 const mail=await Mail.findOneAndUpdate(filter,{$set:{lockedUntil:new Date(Date.now()+60000)},$inc:{attempts:1}},{new:true});if(!mail)return;
 try{if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM_EMAIL)throw Error('Email configuration missing');const result=await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.RESEND_FROM_EMAIL,to:mail.to,subject:mail.subject,text:mail.text},{idempotencyKey:mail.key});if(result.error)throw Error('Email provider rejected request');await Mail.updateOne({_id:mail._id},{$set:{status:'sent'},$unset:{lockedUntil:1,lastError:1}});}
 catch{await Mail.updateOne({_id:mail._id},{$set:{lastError:'Delivery failed; retry required'},$unset:{lockedUntil:1}});}
}
