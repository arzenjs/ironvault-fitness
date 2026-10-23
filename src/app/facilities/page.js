import PageIntro from '@/components/ui/PageIntro';
import Photo from '@/components/ui/Photo';
import Reveal from '@/components/ui/Reveal';
import {facilities} from '@/config/content';
export const metadata={title:'Facilities'};
export default function Facilities(){return <div className="shell"><PageIntro label="THE TRAINING FLOOR" title="EVERY ZONE. A PURPOSE." text="Five fictional training zones designed to support a balanced routine. These are illustrative offerings, not verified physical facilities."/>{facilities.map((f,i)=><Reveal key={f.title} kind="slide"><section className={'split section '+(i%2?'reverse':'')}><Photo id={f.image} alt={f.title+' â€” illustrative photograph'}/><div><p className="eyebrow">ZONE / 0{i+1}</p><h2>{f.title}</h2><p>{f.text}</p><p className="muted">Use equipment within your experience level. Seek qualified guidance when learning an unfamiliar movement.</p></div></section></Reveal>)}</div>;}
