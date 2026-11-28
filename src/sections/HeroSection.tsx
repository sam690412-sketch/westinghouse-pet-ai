import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';

// Dedicated 1344×768 lifestyle banners, not product card images. No model claim.
export const HERO_SCENES = [
  { image: '/images/hero/hero-01.webp', href: '/products' },
  { image: '/images/hero/hero-02.webp', href: '/products/feeders' },
  { image: '/images/hero/hero-03.webp', href: '/products/water-dispensers' },
] as const;

export function HeroSection() {
  const { locale, t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const slides = [
    { title: tr(locale,'用科技，守護每一天。','Smart care. Every day.','ดูแลทุกวันด้วยเทคโนโลยี'), desc: tr(locale,'從日常餵食到飲水，為毛孩與家人打造更從容的生活。','Make daily feeding and hydration easier for pets and their families.','ให้การให้อาหารและน้ำในทุกวันเป็นเรื่องง่ายสำหรับสัตว์เลี้ยงและครอบครัว'), cta: t('products') },
    { title: tr(locale,'每一餐，都有好好準備。','Thoughtful care at mealtime.','ใส่ใจทุกมื้ออาหาร'), desc: tr(locale,'探索鮮濕糧、可視及小型智慧餵食器，選擇適合生活的機型。','Explore fresh-food, camera and compact feeders for your routine.','สำรวจเครื่องให้อาหารเปียก รุ่นพร้อมกล้อง และรุ่นกะทัดรัดที่เหมาะกับชีวิตประจำวัน'), cta: t('feeders') },
    { title: tr(locale,'把新鮮活水，帶進日常。','Fresh flowing water, every day.','น้ำไหลสดใหม่ในทุกวัน'), desc: tr(locale,'了解兩款無線飲水機的容量、續航與過濾設計。','Compare capacity, cordless runtime and filtration across our fountains.','เปรียบเทียบความจุ ระยะเวลาใช้งานแบบไร้สาย และระบบกรองของน้ำพุทั้งสองรุ่น'), cta: t('fountains') },
  ];
  const scene = HERO_SCENES[current];
  const slide = slides[current];
  const go = (offset: number) => setCurrent(v => (v + offset + HERO_SCENES.length) % HERO_SCENES.length);
  return <section aria-label={tr(locale,'首頁橫幅','Featured collection','สินค้าที่แนะนำ')} className="bg-[#101c30] text-white">
    <div className="mx-auto grid max-w-container-lg items-stretch lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
      <div className="order-2 flex min-w-0 flex-col justify-center px-5 py-9 sm:px-10 lg:order-1 lg:px-12 lg:py-16">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[.16em] text-sky-200">WESTINGHOUSE PET · {t('reservation')}</p>
        <h1 className="max-w-xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[clamp(2.5rem,4vw,4rem)]">{slide.title}</h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-200 sm:text-base">{slide.desc}</p>
        <Link to={scene.href} className="mt-7 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#101c30] transition-colors hover:bg-sky-100">{slide.cta}<ArrowRight size={18}/></Link>
        <div className="mt-7 flex items-center gap-3" aria-label={tr(locale,'橫幅控制','Carousel controls','ตัวควบคุมภาพสไลด์')}>
          <button type="button" onClick={()=>go(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/35 hover:bg-white/10" aria-label={tr(locale,'上一張','Previous slide','ภาพก่อนหน้า')}><ChevronLeft size={20}/></button>
          {HERO_SCENES.map((s,i)=><button key={s.image} type="button" aria-label={`${i+1} / ${HERO_SCENES.length}`} aria-current={current===i?'true':undefined} className={`h-8 rounded-full px-1 ${current===i?'text-white':'text-white/55'}`} onClick={()=>setCurrent(i)}><span className={`block h-1.5 rounded-full bg-current transition-all ${current===i?'w-7':'w-3'}`}/></button>)}
          <button type="button" onClick={()=>go(1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/35 hover:bg-white/10" aria-label={tr(locale,'下一張','Next slide','ภาพถัดไป')}><ChevronRight size={20}/></button>
        </div>
      </div>
      <div className="order-1 relative flex min-w-0 items-center bg-[#101c30] lg:order-2">
        {failed.includes(scene.image) ? <div className="flex aspect-[7/4] w-full items-center justify-center text-sm text-white/70">{storefront.imageUnavailable[locale]}</div> : <img key={scene.image} src={scene.image} alt={storefront.previewOnly[locale]} width={1344} height={768} loading="eager" fetchPriority="high" className="aspect-[7/4] h-auto w-full object-contain" onError={()=>setFailed(v=>[...v,scene.image])}/>}
        <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1.5 text-xs">{storefront.previewOnly[locale]}</span>
      </div>
    </div>
  </section>;
}
