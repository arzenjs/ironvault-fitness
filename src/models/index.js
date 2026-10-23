import mongoose from 'mongoose';
const {Schema}=mongoose;
const ref={type:Schema.Types.ObjectId,ref:'User',required:true};
const model=(name,shape,indexes=[])=>{const s=new Schema(shape,{timestamps:true});for(const [fields,options] of indexes)s.index(fields,options);return mongoose.models[name]||mongoose.model(name,s);};
export const User=model('User',{name:String,email:{type:String,unique:true,required:true},password:{type:String,select:false},role:{type:String,enum:['customer','staff','admin'],default:'customer'},enabled:{type:Boolean,default:true},scheduleVersion:{type:Number,default:0}});
export const Payment=model('Payment',{user:ref,planId:String,requestKey:String,amount:Number,currency:{type:String,default:'INR'},orderId:String,paymentId:String,status:{type:String,enum:['pending','successful','failed','abandoned'],default:'pending'},lastAttemptStatus:String,processedAt:Date,creationError:Boolean},[[{user:1,requestKey:1},{unique:true,partialFilterExpression:{requestKey:{$type:'string'}}}],[{orderId:1},{unique:true,partialFilterExpression:{orderId:{$type:'string'}}}],[{paymentId:1},{unique:true,partialFilterExpression:{paymentId:{$type:'string'}}}]]);
export const Membership=model('Membership',{user:ref,payment:{type:Schema.Types.ObjectId,ref:'Payment',unique:true},planId:String,start:Date,end:Date,state:{type:String,enum:['pending','valid'],default:'pending'},suspended:{type:Boolean,default:false},reason:String});
export const Invitation=model('Invitation',{email:String,hash:{type:String,unique:true},expires:Date,used:Date,invitedBy:ref});
export const Audit=model('Audit',{actor:ref,action:String,target:String,reason:String});
export const Event=model('Event',{eventId:{type:String,unique:true},type:String,processedAt:Date});
export const Mail=model('Mail',{key:{type:String,unique:true},to:String,subject:String,text:String,status:{type:String,default:'pending'},attempts:{type:Number,default:0},lockedUntil:Date,lastError:String});
export const Limit=model('Limit',{_id:String,count:Number,expires:Date},[[{expires:1},{expireAfterSeconds:0}]]);
export async function indexes(){await Promise.all([User,Payment,Membership,Invitation,Audit,Event,Mail,Limit].map(m=>m.init()));}
