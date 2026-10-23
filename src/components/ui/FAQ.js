"use client";
import {useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {Plus} from 'lucide-react';
export default function FAQ({items}){const [open,setOpen]=useState(null);const reduced=useReducedMotion();return <div className="faq-list">{items.map((item,i)=><section key={item.q} className="faq-item"><h3><button aria-expanded={open===i} aria-controls={'answer-'+i} onClick={()=>setOpen(open===i?null:i)}>{item.q}<Plus aria-hidden="true" className={open===i?'rotated':''}/></button></h3><AnimatePresence initial={false}>{open===i&&<motion.div id={'answer-'+i} initial={{height:reduced?'auto':0,opacity:reduced?1:0}} animate={{height:'auto',opacity:1}} exit={{height:reduced?'auto':0,opacity:0}} transition={{duration:reduced?0:.22}} className="faq-answer"><p>{item.a}</p></motion.div>}</AnimatePresence></section>)}</div>;}
