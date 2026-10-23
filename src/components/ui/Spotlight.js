"use client";
import {useRef} from 'react';
export default function Spotlight({children,className=''}){const ref=useRef(null);function move(e){if(e.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const box=e.currentTarget.getBoundingClientRect();ref.current.style.setProperty('--pointer-x',(e.clientX-box.left)+'px');ref.current.style.setProperty('--pointer-y',(e.clientY-box.top)+'px');}return <div ref={ref} className={'spotlight '+className} onPointerMove={move}>{children}</div>;}
