import { forwardRef, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';

export interface FooterLinkGroup { title: string; links: { label:string; href:string }[]; }
export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
 logoText?:string;tagline?:string;linkGroups?:FooterLinkGroup[];
 contact?:{phone?:string;email?:string;address?:string;hours?:string};social?:{facebook?:string;instagram?:string;youtube?:string};
 onNewsletterSubmit?:(email:string)=>void;copyright?:string;bottomLinks?:{label:string;href:string}[];
}
export const Footer=forwardRef<HTMLElement,FooterProps>(({logoText='Westinghouse Pet',tagline,linkGroups,contact,social,onNewsletterSubmit,copyright,bottomLinks=[],className,...props},ref)=>{
 const {locale,t}=useI18n();const [email,setEmail]=useState('');
 const groups=linkGroups??[
  {title:t('products'),links:[{label:t('products'),href:'/products'},{label:t('feeders'),href:'/products/feeders'},{label:t('fountains'),href:'/products/water-dispensers'},{label:tr(locale,'耗材配件','Accessories','อุปกรณ์เสริม'),href:'/products/accessories'}]},
  {title:t('guides'),links:[{label:t('guides'),href:'/solutions'},{label:t('faq'),href:'/faq'},{label:t('reviews'),href:'/reviews'}]},
  {title:t('brand'),links:[{label:t('brand'),href:'/brand'},{label:tr(locale,'授權資訊','Authorization','ข้อมูลการอนุญาต'),href:'/trust/official-license'},{label:tr(locale,'保固資訊','Warranty','การรับประกัน'),href:'/trust/warranty-commitment'},{label:t('contact'),href:'/contact'}]},
 ];
 const link=(item:{href:string;label:string})=>item.href.startsWith('/')&&!item.href.startsWith('//')?<Link className="hover:text-white hover:underline" to={item.href}>{item.label}</Link>:<a className="hover:text-white hover:underline" href={item.href}>{item.label}</a>;
 return <footer ref={ref} className={cn('bg-[#101c30] text-slate-200',className)} {...props}><div className="container-section py-10 sm:py-14">
  <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]"><div><Link to="/" className="text-2xl font-bold tracking-tight text-white">{logoText}</Link><p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">{tagline??tr(locale,'讓智慧科技融入與毛孩相伴的日常。','Smart technology for everyday companionship.','เทคโนโลยีอัจฉริยะเพื่อชีวิตประจำวันกับสัตว์เลี้ยง')}</p><p className="mt-4 text-sm text-slate-300">{storefront.support[locale]}</p>{contact&&<div className="mt-3 space-y-1 text-sm">{contact.phone&&<p>{contact.phone}</p>}{contact.email&&<p>{contact.email}</p>}{contact.address&&<p>{contact.address}</p>}{contact.hours&&<p>{contact.hours}</p>}</div>}{social&&<div className="mt-4 flex flex-wrap gap-3 text-xs">{Object.entries(social).filter(([,url])=>url?.startsWith('https://')).map(([key,url])=><a key={key} href={url} rel="noopener noreferrer" target="_blank">{key}</a>)}</div>}</div>
  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">{groups.map(group=><div key={group.title}><h3 className="mb-4 font-semibold text-white">{group.title}</h3><ul className="space-y-2.5 text-sm">{group.links.map(item=><li key={item.href+item.label}>{link(item)}</li>)}</ul></div>)}</div></div>
  {onNewsletterSubmit&&<form className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/15 pt-5" onSubmit={e=>{e.preventDefault();if(email.trim()){onNewsletterSubmit(email.trim());setEmail('');}}}><label className="text-sm">{tr(locale,'訂閱上市資訊','Launch updates','รับข่าวสารเปิดตัว')}</label><input type="email" value={email} required onChange={e=>setEmail(e.target.value)} className="min-w-0 rounded border border-white/30 bg-white/10 px-3 py-2"/><button type="submit" className="rounded border px-4 py-2 text-sm">{tr(locale,'訂閱','Subscribe','สมัครรับข่าวสาร')}</button></form>}
  <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-5 text-xs text-slate-300"><span>{copyright??`© ${new Date().getFullYear()} Westinghouse Pet Taiwan`}</span><span>{storefront.terms[locale]}</span>{bottomLinks.length>0&&<div className="flex flex-wrap gap-3">{bottomLinks.map(item=><span key={item.href}>{link(item)}</span>)}</div>}</div>
 </div></footer>;
});
Footer.displayName='Footer';
