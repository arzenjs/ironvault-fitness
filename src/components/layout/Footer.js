import Link from 'next/link';
import {gym} from '@/config/gym';
import {navigation} from '@/config/navigation';
import {Logo} from './Header';
export default function Footer(){return <footer className="footer"><div className="footer-grid"><div><Link href="/"><Logo/></Link><p>Make space for the work.<br/>Make room for progress.</p><p className="muted">{gym.address}</p></div><nav aria-label="Footer">{navigation.map(([name,url])=><Link key={url} href={url}>{name}</Link>)}</nav><div><a href="tel:+919876512340">{gym.phone}</a><a href={'mailto:'+gym.email}>{gym.email}</a><p>{gym.hours}<br/>{gym.sunday}</p><Link href="/staff">Staff portal</Link><Link href="/admin">Admin portal</Link></div></div><div className="footer-bottom"><p>Â© {new Date().getFullYear()} IronVault Fitness â€” fictional portfolio demo.</p><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><p className="demo-note">{gym.demo}</p></footer>;}
