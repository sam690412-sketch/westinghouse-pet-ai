import { IS_LIVE_STORE } from '@/config/storeConfig';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';

// No fabricated recent purchases, viewer counts, or rating totals.
export function SocialProofBar() { return null; }
interface UrgencyBannerProps { stockStatus: string; stockQuantity?: number; viewerCount?: number; }
export function UrgencyBanner({stockStatus}: UrgencyBannerProps) {
  const {locale}=useI18n();
  if(IS_LIVE_STORE && stockStatus!=='out_of_stock')return null;
  return <div className="container-section py-3 text-sm text-muted-foreground">{IS_LIVE_STORE?tr(locale,'暫時缺貨','Temporarily out of stock','สินค้าหมดชั่วคราว'):storefront.shipping[locale]}</div>;
}
