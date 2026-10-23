import '@fontsource/bebas-neue/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@/styles/globals.css';
import '@/styles/responsive.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
export const metadata={metadataBase:new URL(process.env.AUTH_URL||'http://localhost:3000'),title:{default:'IronVault Fitness â€” Built for Strength',template:'%s | IronVault Fitness'},description:'A fictional premium fitness portfolio demo in Patna. Built for Strength. Designed for Progress.',icons:{icon:'/favicon.svg'},openGraph:{title:'IronVault Fitness',description:'Built for Strength. Designed for Progress. Fictional portfolio demo.',images:[{url:'/images/hero.jpg',alt:'IronVault fitness demo'}]}};
export default function Layout({children}){return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></body></html>;}
