import PageIntro from '@/components/ui/PageIntro';
import Gallery from '@/components/gallery/Gallery';
export const metadata={title:'Gallery'};
export default function GalleryPage(){return <div className="shell"><PageIntro label="VISUAL JOURNAL" title="INSIDE THE EFFORT." text="Training photography used to illustrate the fictional IronVault atmosphere. Use category filters, then open a photo. Arrow keys navigate the lightbox; Escape closes it."/><Gallery/><p className="demo-note">Illustrative stock photography, not photographs of a real IronVault facility.</p></div>;}
