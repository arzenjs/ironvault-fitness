"use client";
import {useState} from 'react';
import {signOut} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import {post} from '@/components/ui/Forms';
export function Logout(){return <button className="button outline" onClick={()=>signOut({callbackUrl:'/'})}>Log out</button>;}
export function Recheck({id}){const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const router=useRouter();async function run(){setBusy(true);try{const r=await post('/api/payments/reconcile',{purchaseId:id});setMessage('Provider status: '+r.status);router.refresh();}catch(e){setMessage(e.message);}finally{setBusy(false);}}return <div><button className="button outline compact" disabled={busy} onClick={run}>{busy?'Checkingâ€¦':'Check payment'}</button><small role="status">{message}</small></div>;}
