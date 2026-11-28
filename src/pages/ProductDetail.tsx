import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { ShoppingCart, ArrowRight, ShieldCheck, CalendarClock } from 'lucide-react';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';
import { productBySku } from '@/i18n/products';
import { AuthenticReviewsSection } from '@/sections/AuthenticReviewsSection';
import { ProductComparison } from '@/components/organism/ProductComparison';
import { ProductExplodedView } from '@/components/organism/ProductExplodedView';
import { ProductHeroSection } from '@/sections/ProductHeroSection';
import { ProductFeaturesSection } from '@/sections/ProductFeaturesSection';
import { ProductSpecsSection } from '@/sections/ProductSpecsSection';
import { ProductFAQSection } from '@/sections/ProductFAQSection';
import { useProduct } from '@/hooks/useCMS';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { IS_LIVE_STORE } from '@/config/storeConfig';

const DETAIL_DIR_MAP: Record<string,string> = {
 'm81-fresh-food-feeder':'/images/products/detail/m81/', 'm12-panoramic-feeder':'/images/products/detail/m12/', 'm31-gashapon-feeder':'/images/products/detail/m31/', 'd11ba-water-dispenser':'/images/products/detail/d11-ba/', 'd61-stainless-dispenser':'/images/products/detail/d61/',
};
const DETAIL_COUNTS: Record<string,number> = {'m81-fresh-food-feeder':5,'m12-panoramic-feeder':6,'m31-gashapon-feeder':5,'d11ba-water-dispenser':6,'d61-stainless-dispenser':5};
const LIFESTYLE_IMAGE_MAP: Record<string,string> = {'m81-fresh-food-feeder':'/images/products/m81-lifestyle.jpg','m12-panoramic-feeder':'/images/products/m12-lifestyle.jpg','m31-gashapon-feeder':'/images/products/m31-lifestyle.jpg','d11ba-water-dispenser':'/images/products/d11ba-lifestyle.jpg','d61-stainless-dispenser':'/images/products/d61-lifestyle.jpg'};

export default function ProductDetail(){
 const {slug}=useParams<{slug:string}>();
 const {data:product,isLoading:loading,error}=useProduct(slug||'');
 const {locale,t}=useI18n();
 const {addItem,isLoading:cartLoading}=useCart();
 const copy=productBySku(product?.slug??slug??'',locale);
 useEffect(()=>{
  if(!product)return;
  const currentCopy=productBySku(product.slug,locale);
  const title=`${currentCopy?.name??product.name} | Westinghouse Pet`;
  const description=currentCopy?currentCopy.specs.map(([k,v])=>`${k}: ${v}`).join(' · '):product.short_description??'';
  const previousTitle=document.title;document.title=title;
  const metaValues: [string,string,string][]=[['name','description',description],['property','og:title',title],['property','og:description',description]];
  let imageUrl: string | undefined;
  if(product.hero_image_url){try{const url=new URL(product.hero_image_url,window.location.origin);if(url.protocol==='https:'||url.protocol==='http:')imageUrl=url.href;}catch{/* Ignore malformed CMS image metadata. */}}
  if(imageUrl)metaValues.push(['property','og:image',imageUrl]);
  const restore=metaValues.map(([attr,key,value])=>{let element=document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);const existed=!!element;const old=element?.content??'';if(!element){element=document.createElement('meta');element.setAttribute(attr,key);document.head.appendChild(element);}element.content=value;const target=element;return()=>{if(existed)target.content=old;else target.remove();};});
  document.getElementById('jsonld-product')?.remove();
  const script=document.createElement('script');script.id='jsonld-product';script.type='application/ld+json';
  // Product metadata stays useful; no fake aggregate rating, shipping policy, or sale offer before launch.
  script.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Product',name:currentCopy?.name??product.name,description,sku:product.sku,brand:{'@type':'Brand',name:'Westinghouse Pet'},image:imageUrl,...(IS_LIVE_STORE?{offers:{'@type':'Offer',priceCurrency:'TWD',price:product.price/100,availability:product.stock_status==='in_stock'?'https://schema.org/InStock':product.stock_status==='low_stock'?'https://schema.org/LimitedAvailability':product.stock_status==='pre_order'?'https://schema.org/PreOrder':'https://schema.org/OutOfStock'}}:{})});
  document.head.appendChild(script);
  return()=>{script.remove();document.title=previousTitle;restore.forEach(fn=>fn());};
 },[product,locale]);
 if(loading)return <div role="status" className="container-section flex min-h-[60vh] items-center justify-center">{t('loading')}</div>;
 if(error||!product)return <div className="container-section py-20 text-center"><h1 className="text-2xl font-bold">{error?storefront.unavailable[locale]:tr(locale,'商品目前未開放展示','Product currently unavailable','สินค้านี้ยังไม่พร้อมแสดง')}</h1><Link to="/products" className="mt-5 inline-flex text-primary underline">{t('products')}</Link></div>;
 const displayProduct=copy?{...product,name:copy.name,tagline:copy.tagline}:product;
 const specs=copy?copy.specs.map(([label,value])=>({label,value})):(product.specs??[]);
 const features=copy?copy.features.map(title=>({icon:'check-circle',title,description:''})):(product.features??[]);
 const detailDir=DETAIL_DIR_MAP[product.slug];const count=DETAIL_COUNTS[product.slug]??0;
 const detailImages=detailDir?Array.from({length:count},(_,i)=>`${detailDir}${String(i+1).padStart(2,'0')}.webp`):[];
 const lifestyle=LIFESTYLE_IMAGE_MAP[product.slug];
 const add=async()=>{try{await addItem(product.sku,1);}catch{/* CartDrawer shows current failure. */}window.dispatchEvent(new Event('wpet:open-cart'));};
 return <main>
  <nav aria-label={tr(locale,'麵包屑','Breadcrumb','เส้นทางการนำทาง')} className="container-section py-4 text-xs text-muted-foreground sm:text-sm"><ol className="flex flex-wrap items-center gap-2"><li><Link to="/">{t('home')}</Link></li><li>/</li><li><Link to="/products">{t('products')}</Link></li><li>/</li><li aria-current="page" className="font-medium text-foreground">{displayProduct.name}</li></ol></nav>
  <ProductHeroSection key={product.slug} product={displayProduct}/>
  <ProductExplodedView key={product.slug} slug={product.slug} />
  {features.length>0&&<ProductFeaturesSection features={features}/>}
  {specs.length>0&&<ProductSpecsSection specs={specs}/>}
  {lifestyle&&<section className="bg-neutral-50 py-10"><div className="container-section"><h2 className="mb-6 text-center text-2xl font-bold">{tr(locale,'生活情境','Made for everyday life','ภาพการใช้งานในชีวิตประจำวัน')}</h2><img src={lifestyle} alt={`${displayProduct.name} · ${storefront.previewOnly[locale]}`} className="mx-auto w-full max-w-[1100px] rounded-2xl object-contain" loading="lazy"/><p className="mt-2 text-center text-xs text-muted-foreground">{storefront.previewOnly[locale]}</p></div></section>}
  <ProductComparison />
  {product.faq_items&&product.faq_items.length>0&&<ProductFAQSection faqItems={product.faq_items}/>}
  {detailImages.length>0&&<section className="py-12"><div className="container-section"><h2 className="mb-8 text-center text-2xl font-bold">{tr(locale,'產品詳細介紹','Product details','รายละเอียดสินค้า')}</h2>{locale!=='zh-TW'&&<p className="mb-4 text-center text-sm text-muted-foreground">{tr(locale,'','Original product artwork; embedded text may be Chinese.','ภาพผลิตภัณฑ์ต้นฉบับอาจมีข้อความภาษาจีน')}</p>}<div className="mx-auto flex max-w-[1200px] flex-col gap-6">{detailImages.map((src,i)=><img key={src} src={src} alt={`${displayProduct.name} · ${i+1}`} className="w-full rounded-lg object-contain" loading="lazy" decoding="async"/>)}</div></div></section>}
  <AuthenticReviewsSection productSlug={product.slug} />
  <section className="border-t bg-neutral-50 py-10"><div className="container-section grid gap-4 sm:grid-cols-2"><div className="rounded-xl border bg-white p-5"><ShieldCheck className="mb-3 text-primary"/><h2 className="font-semibold">{storefront.warranty[locale]}</h2><p className="mt-2 text-sm text-muted-foreground">{storefront.support[locale]}</p></div><div className="rounded-xl border bg-white p-5"><CalendarClock className="mb-3 text-primary"/><h2 className="font-semibold">{storefront.shipping[locale]}</h2><p className="mt-2 text-sm text-muted-foreground">{storefront.terms[locale]}</p></div></div></section>
  <section className="bg-[#10253c] py-12 text-white"><div className="container-section text-center"><h2 className="text-3xl font-bold">{IS_LIVE_STORE?t('explore'):t('reservation')}</h2><p className="mx-auto mt-4 max-w-2xl text-sm text-white/80">{displayProduct.name} · {storefront.terms[locale]}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button className="h-auto min-h-11 gap-2 whitespace-normal bg-white px-6 text-[#10253c] hover:bg-sky-100" disabled={cartLoading} onClick={()=>void add()}><ShoppingCart size={18}/>{IS_LIVE_STORE?t('cart'):t('add')}</Button><Link to="/products" className="inline-flex items-center gap-2 rounded-md border border-white/50 px-5 py-3 text-sm">{t('products')}<ArrowRight size={16}/></Link></div></div></section>
 </main>;
}
