import { CalendarClock, ClipboardCheck, ShieldCheck, Headphones } from 'lucide-react';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';
export function TrustIndicatorsSection(){
 const {locale,t}=useI18n();
 const items=[{Icon:ClipboardCheck,title:t('specs'),desc:tr(locale,'依原廠提供規格整理','Manufacturer specifications','ข้อมูลจำเพาะจากผู้ผลิต')},{Icon:CalendarClock,title:t('reservation'),desc:storefront.noPayment[locale]},{Icon:ShieldCheck,title:tr(locale,'上市資訊','Launch information','ข้อมูลการเปิดตัว'),desc:storefront.terms[locale]},{Icon:Headphones,title:tr(locale,'售後服務','After-sales service','บริการหลังการขาย'),desc:storefront.support[locale]}];
 return <section className="border-b bg-white py-6" aria-label={tr(locale,'服務資訊','Service information','ข้อมูลบริการ')}><div className="container-section grid grid-cols-2 gap-4 lg:grid-cols-4">{items.map(({Icon,title,desc})=><div key={title} className="flex flex-col gap-2 rounded-xl p-2 sm:flex-row sm:items-start sm:p-4"><Icon className="h-6 w-6 shrink-0 text-primary"/><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p></div></div>)}</div></section>;
}
