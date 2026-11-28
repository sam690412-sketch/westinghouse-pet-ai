import { useState } from 'react';
import { ShoppingCart, AlertTriangle, Check, CalendarClock, PackageCheck } from 'lucide-react';
import { IS_LIVE_STORE } from '@/config/storeConfig';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';
import { galleryFor } from '@/data/productGallery';
import { cn } from '@/lib/utils';
import type { CMSProduct } from '@/types/cms';
import { StorefrontPrice } from '@/components/atomic/StorefrontPrice';
import { StockStatus } from '@/components/atomic/StockStatus';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from '@/components/atomic/QuantitySelector';
import { useCart } from '@/hooks/useCart';

interface ProductHeroSectionProps { product: CMSProduct; }

export function ProductHeroSection({product}: ProductHeroSectionProps) {
 const {locale,t}=useI18n();
 const [quantity,setQuantity]=useState(1);
 const [selectedImage,setSelectedImage]=useState(0);
 const [failedImages,setFailedImages]=useState<string[]>([]);
 const [added,setAdded]=useState(false);
 const {addItem,isLoading:cartLoading,error:cartError}=useCart();
 const isOutOfStock=IS_LIVE_STORE&&product.stock_status==='out_of_stock';
 const isLowStock=IS_LIVE_STORE&&product.stock_status==='low_stock';
 const isPreorder=!IS_LIVE_STORE||product.stock_status==='pre_order';
 const galleryImages=galleryFor(product.slug,product.name,product.hero_image_url);
 const image=galleryImages[selectedImage]??galleryImages[0];
 const selectImage=(i:number)=>{setSelectedImage(i);setFailedImages(old=>old.filter(url=>url!==galleryImages[i]?.url));};
 const markFailed=(url:string)=>setFailedImages(old=>old.includes(url)?old:[...old,url]);
 const roles=[tr(locale,'主圖','Main view','ภาพหลัก'),tr(locale,'生活情境','Lifestyle','ภาพการใช้งาน'),tr(locale,'側面圖','Side view','ภาพด้านข้าง')];
 const add=async()=>{try{await addItem(product.sku,quantity);setAdded(true);if(!IS_LIVE_STORE)window.dispatchEvent(new Event('wpet:open-cart'));}catch{/* CartProvider retains the failure. */}};
 return <section className="mx-auto max-w-container-lg px-4 py-6 sm:px-6 lg:px-8 lg:py-10" aria-label={tr(locale,'商品資訊','Product information','ข้อมูลสินค้า')}>
  <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
   <div className="space-y-3">
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-white lg:aspect-auto lg:h-[560px]">
     {image&&!failedImages.includes(image.url)?<img key={image.url} src={image.url} alt={`${product.name} · ${roles[selectedImage]??''}`} className="h-full w-full object-contain" onError={()=>markFailed(image.url)} loading="eager"/>:<div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center text-sm text-muted-foreground"><p>{storefront.imageUnavailable[locale]}</p><Button variant="outline" onClick={()=>selectImage(selectedImage)}>{tr(locale,'重新載入','Reload image','โหลดรูปภาพอีกครั้ง')}</Button></div>}
     {isPreorder&&<span className="absolute left-3 top-3 rounded-full bg-[#10253c] px-3 py-1.5 text-xs font-semibold text-white">{t('reservation')}</span>}
    </div>
    {galleryImages.length>1&&<div className="flex flex-wrap gap-2">{galleryImages.map((img,i)=><button key={img.url} type="button" onClick={()=>selectImage(i)} aria-label={tr(locale,`圖片 ${i+1}`,`Image ${i+1}`,`รูปภาพ ${i+1}`)} aria-pressed={i===selectedImage} className={cn('flex min-w-[64px] flex-col items-center rounded-xl border p-1 text-[10px] sm:text-xs',i===selectedImage?'border-primary ring-1 ring-primary':'border-border')}><span className="block h-12 w-14 overflow-hidden sm:h-16 sm:w-20">{!failedImages.includes(img.url)?<img src={img.url} alt={`${product.name} ${roles[i]??''}`} className="h-full w-full object-contain" loading="lazy" onError={()=>markFailed(img.url)}/>:<PackageCheck className="m-auto mt-3 text-muted-foreground"/>}</span><span className="px-1 py-1 text-muted-foreground">{roles[i]??i+1}</span></button>)}</div>}
   </div>
   <div className="min-w-0 lg:py-5">
    <p className="text-xs font-semibold uppercase tracking-widest text-primary">{product.category==='feeder'?t('feeders'):product.category==='water_dispenser'?t('fountains'):tr(locale,'耗材配件','Accessories','อุปกรณ์เสริม')}</p>
    <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
    {product.tagline&&<p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{product.tagline}</p>}
    <div className="mt-6 border-y py-5"><StorefrontPrice slug={product.slug} price={product.price} originalPrice={product.compare_at_price??undefined} size="lg"/></div>
    {IS_LIVE_STORE?<div className="mt-4"><StockStatus status={product.stock_status}/></div>:<div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-[#10253c]"><CalendarClock size={20} className="mt-0.5 shrink-0"/><div><p className="font-semibold">{storefront.shipping[locale]}</p><p className="mt-1 leading-relaxed">{storefront.noPayment[locale]}</p></div></div>}
    <div className="mt-5 space-y-3">
     {!isOutOfStock&&<div className="flex items-center gap-3"><label className="text-sm font-medium">{t('qty')}</label><QuantitySelector value={quantity} onChange={setQuantity} max={isLowStock?product.stock_quantity:99}/></div>}
     {cartError&&<p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertTriangle size={17} className="shrink-0"/>{cartError}</p>}
     {added&&<p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><Check size={17}/>{tr(locale,'已加入清單','Added to your list','เพิ่มในรายการแล้ว')}</p>}
     <Button type="button" size="lg" className="h-auto min-h-12 w-full gap-2 whitespace-normal py-3 text-base" disabled={isOutOfStock||cartLoading} onClick={()=>void add()}><ShoppingCart size={20}/>{isOutOfStock?tr(locale,'暫時缺貨','Out of stock','สินค้าหมด'):isPreorder?t('add'):tr(locale,'加入購物車','Add to cart','เพิ่มลงตะกร้า')}</Button>
     {IS_LIVE_STORE&&!isOutOfStock&&<Button variant="outline" size="lg" className="w-full" onClick={async()=>{try{await addItem(product.sku,quantity);window.location.hash='#/checkout';}catch{/* show cart error */}}}>{t('checkout')}</Button>}
    </div>
    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{storefront.terms[locale]}</p><p className="mt-3 text-xs text-muted-foreground">SKU: {product.sku}</p>
   </div>
  </div>
 </section>;
}
