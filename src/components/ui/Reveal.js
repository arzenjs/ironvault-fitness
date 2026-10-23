"use client";
import {useRef} from 'react';
import {motion,useReducedMotion,useInView} from 'motion/react';
export default function Reveal({children,className='',kind='rise',delay=0}){const ref=useRef(null);const inView=useInView(ref,{once:true,amount:.12});const reduced=useReducedMotion();const offsets={rise:{y:26},slide:{x:-24},zoom:{scale:.97}};return <motion.div ref={ref} className={className} initial={false} animate={reduced?{}:inView?{y:0,x:0,scale:1}:offsets[kind]} transition={{duration:.55,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>;}
