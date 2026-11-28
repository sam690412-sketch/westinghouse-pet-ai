import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { ProductData } from '@/data/products';
import { useProductPricing } from '@/context/ProductPricingContext';
import { productBySku } from '@/i18n/products';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';
import { StorefrontPrice } from '@/components/atomic/StorefrontPrice';

export function CatalogGrid({items,compact=false}:{items:ProductData[];compact?:boolean}) {
 const {locale,t}=useI18n();
 const {catalogStatus,refresh}=useProductPricing();
 if(catalogStatus==='loading')return <div role="status" className="py-10 text-center text-sm text-muted-foreground">{t('loading')}</div>;
 if(catalogStatus==='error')return <div role="status" className="rounded-xl border bg-white p-8 text-center"><p>{storefront.unavailable[locale]}</p><button className="mt-3 rounded-md border px-4 py-2" onClick={()=>void refresh()}>{tr(locale,'重新載入','Retry','ลองอีกครั้ง')}</button></div>;
 if(!items.length)return <p className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">{tr(locale,'目前沒有符合的上架商品。','No listed products match your selection.','ไม่มีสินค้าที่ตรงกับรายการที่เลือก')}</p>;
 return <div className={`grid grid-cols-2 gap-3 sm:gap-5 ${compact?'lg:grid-cols-3 xl:grid-cols-5':'lg:grid-cols-3'}`}>
  {items.map(p=>{const copy=productBySku(p.slug,locale);return <article key={p.slug} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg"><Link to={`/products/${p.slug}`} className="block bg-neutral-50"><img src={p.image} alt={copy?.name??p.name} loading="lazy" className="aspect-square w-full object-contain p-3 sm:p-5"/></Link><div className="flex flex-1 flex-col p-3 sm:p-5"><h3 className="text-sm font-semibold leading-snug sm:text-lg"><Link to={`/products/${p.slug}`} className="hover:text-primary">{copy?.name??p.name}</Link></h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{copy?.tagline??p.tagline}</p><div className="mt-auto pt-4"><StorefrontPrice slug={p.slug} price={p.price} originalPrice={p.originalPrice} size="sm"/></div><Link to={`/products/${p.slug}`} className="mt-4 flex min-h-10 items-center justify-between gap-1 rounded-lg border px-2 py-2 text-xs font-medium text-primary hover:bg-primary/5 sm:px-3 sm:text-sm">{t('explore')}<ArrowRight size={15} className="shrink-0"/></Link></div></article>;})}
 </div>;
}
