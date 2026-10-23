import Link from 'next/link';
import Spotlight from '@/components/ui/Spotlight';
import {Check,ArrowUpRight} from 'lucide-react';
import {plans,money} from '@/config/membership-plans';
export default function Plans(){return <div className="plan-grid">{plans.map(p=><Spotlight key={p.id}><article className={'plan-card '+(p.recommended?'recommended':'')}><span className="eyebrow">{p.recommended?'The consistent choice':'Build your rhythm'}</span><h3>{p.name}</h3><p className="price">{money(p.pricePaise)}</p><p className="muted">{p.months} calendar {p.months===1?'month':'months'} Â· one-time payment</p><ul>{p.benefits.map(b=><li key={b}><Check size={17} aria-hidden="true"/>{b}</li>)}</ul><Link className={'button '+(!p.recommended?'outline':'')} href={'/checkout?plan='+p.id}>Choose {p.months===1?'monthly':p.months===3?'quarterly':'annual'}<ArrowUpRight size={18}/></Link></article></Spotlight>)}</div>;}
