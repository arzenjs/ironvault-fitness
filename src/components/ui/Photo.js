"use client";
import Image from 'next/image';
import {useState} from 'react';
export default function Photo({id,alt='',priority=false,className=''}){const [failed,setFailed]=useState(false);return <div className={'photo '+className}>{failed?<div className="image-fallback" role="img" aria-label={alt||'Decorative image unavailable'}>IRONVAULT<br/><small>Image unavailable</small></div>:<Image src={'/images/'+id+'.jpg'} alt={alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 70vw" priority={priority} onError={()=>setFailed(true)}/>}</div>;}
