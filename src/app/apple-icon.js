import {ImageResponse} from 'next/og';
export const size={width:180,height:180};export const contentType='image/png';
export default function Icon(){return new ImageResponse(<div style={{width:180,height:180,background:'#101113',display:'flex',alignItems:'center',justifyContent:'center',color:'#ed3b32',fontSize:90,fontWeight:900,border:'14px solid #ed3b32'}}>IV</div>,size);}
