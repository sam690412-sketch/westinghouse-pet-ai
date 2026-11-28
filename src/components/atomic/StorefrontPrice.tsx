import { IS_LIVE_STORE } from '@/config/storeConfig';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';
import { modelBySlug } from '@/i18n/products';
import { useProductPricing } from '@/context/ProductPricingContext';
import { PriceDisplay } from './PriceDisplay';

export function StorefrontPrice({slug,price,originalPrice,size='md'}:{slug:string;price:number;originalPrice?:number;size?:'sm'|'md'|'lg'}) {
 const {locale,t}=useI18n();
 const {prices}=useProductPricing();
 const model=modelBySlug[slug];
 const approved=model ? prices[model==='D11BA'?'D11-BA':model] : undefined;
 if(IS_LIVE_STORE) return <PriceDisplay price={price} originalPrice={originalPrice} size={size}/>;
 // Reference prices always come from the approved TWD catalog. Never infer regional prices or a payable amount.
 if(approved?.listed!==true || !Number.isSafeInteger(approved.promo_twd) || approved.promo_twd<=0) return <p className="text-sm text-muted-foreground">{t('pending')}</p>;
 return <div><p className="mb-1 text-xs leading-relaxed text-muted-foreground">{storefront.referencePrice[locale]}</p><PriceDisplay price={approved.promo_twd*100} size={size} showDiscount={false}/><p className="mt-1 text-xs text-muted-foreground">{tr(locale,'建議售價','MSRP','ราคาขายปลีกแนะนำ')}: NT${approved.msrp_twd.toLocaleString('zh-TW')}</p></div>;
}
