import {ImageResponse} from 'next/og';
export const size={width:64,height:64};export const contentType='image/png';
export default function Icon(){return new ImageResponse(<div style={{width:64,height:64,background:'#101113',display:'flex',alignItems:'center',justifyContent:'center',color:'#ed3b32',fontSize:35,fontWeight:900,border:'6px solid #ed3b32'}}>IV</div>,size);}
