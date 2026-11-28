import { Link, useParams } from 'react-router';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/i18n';
import { tr } from '@/i18n/storefront';
import { launchGuides } from '@/i18n/launchContent';
import { useProductPricing } from '@/context/ProductPricingContext';
import { CatalogGrid } from '@/components/organism/CatalogGrid';
export default function SolutionDetailPage(){const {slug}=useParams<{slug:string}>();const {locale,t}=useI18n();const {products}=useProductPricing();const item=launchGuides.find(x=>x.slug===slug);if(!item)return <PageLayout title={t('guides')}><Link to="/solutions" className="text-primary underline">{t('guides')}</Link></PageLayout>;return <PageLayout title={item.label[locale]} subtitle={item.intro[locale]} breadcrumbs={[{label:t('guides'),href:'/solutions'},{label:item.label[locale]}]}><ol className="mb-8 space-y-3">{item.tips.map((tip,i)=><li key={i} className="flex items-start gap-4 rounded-xl border bg-white p-5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">{i+1}</span><span className="text-sm leading-relaxed">{tip[locale]}</span></li>)}</ol><h2 className="mb-5 text-xl font-bold">{tr(locale,'相關機型','Related models','รุ่นที่เกี่ยวข้อง')}</h2><CatalogGrid items={products.filter(p=>item.models.includes(p.slug))}/></PageLayout>;}
