import PageIntro from '@/components/ui/PageIntro';
import Photo from '@/components/ui/Photo';
import {trainers} from '@/config/content';
export const metadata={title:'Trainers'};
export default function Trainers(){return <div className="shell"><PageIntro label="COACHING" title="GUIDANCE THAT MEETS YOU HERE." text="Fictional coach profiles, with training imagery rather than portraits of real named people. No credentials or experience claims are represented as verified."/><section className="trainer-grid section">{trainers.map(t=><article className="trainer-card" key={t.name}><Photo id={t.image} alt="Illustrative training photo, not the named fictional coach"/><span className="eyebrow">{t.specialty}</span><h2>{t.name}</h2><p>{t.text}</p><p className="muted">Demo coaching approach: explain, observe, adjust and encourage.</p></article>)}</section></div>;}
