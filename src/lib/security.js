import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
import {db} from './db.js';
import {Limit} from '../models/index.js';
export class SafeError extends Error{constructor(message,status=400){super(message);this.status=status;}}
export const hash=s=>createHash('sha256').update(s).digest('hex');
export function signature(body,received,secret){if(!secret||!received||!/^[a-f0-9]{64}$/i.test(received))return false;const expected=createHmac('sha256',secret).update(body).digest();return timingSafeEqual(expected,Buffer.from(received,'hex'));}
export function origin(req){const expected=new URL(process.env.AUTH_URL||'http://localhost:3000').origin;if(req.headers.get('origin')!==expected)throw new SafeError('Request origin rejected',403);}
export async function rate(key,max=10){await db();const bucket=Math.floor(Date.now()/600000);const row=await Limit.findOneAndUpdate({_id:hash(key)+':'+bucket},{$inc:{count:1},$setOnInsert:{expires:new Date(Date.now()+1200000)}},{upsert:true,new:true});if(row.count>max)throw new SafeError('Too many requests. Try again later.',429);}
export async function body(req){if(Number(req.headers.get('content-length'))>16384)throw new SafeError('Request too large',413);const text=await req.text();if(text.length>16384)throw new SafeError('Request too large',413);try{return JSON.parse(text);}catch{throw new SafeError('Invalid request');}}
export function failure(e){if(e?.name==='ZodError')return Response.json({error:e.issues[0].message},{status:400});if(e?.code===11000)return Response.json({error:'Account or record already exists'},{status:409});if(e instanceof SafeError)return Response.json({error:e.message},{status:e.status});console.error('Operation failed:',e?.name||'Error');return Response.json({error:'Service unavailable. Please try again.'},{status:503});}
export const endpoint=fn=>async req=>{try{return await fn(req);}catch(e){return failure(e);}};
