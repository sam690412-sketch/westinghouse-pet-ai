import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';
import { useProductPricing } from '@/context/ProductPricingContext';
import { CatalogGrid } from '@/components/organism/CatalogGrid';

export function BestsellerSection(){
 const {locale,t}=useI18n();const {products}=useProductPricing();
 return <section className="bg-neutral-50 py-12 sm:py-16 lg:py-20" aria-label={storefront.collection[locale]}><div className="container-section"><p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">THE COLLECTION</p><h2 className="mb-3 text-center text-3xl font-bold tracking-tight lg:text-4xl">{storefront.collection[locale]}</h2><p className="mx-auto mb-8 max-w-2xl text-center text-sm text-muted-foreground">{tr(locale,'依照毛孩的飲食習慣與居家需求，選擇合適的機型。','Find a model that fits your pet’s routine and your home.','เลือกรุ่นที่เหมาะกับกิจวัตรของสัตว์เลี้ยงและบ้านของคุณ')}</p><CatalogGrid items={products} compact/><div className="mt-8 text-center"><Link to="/products" className="inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-semibold">{t('products')}<ArrowRight size={17}/></Link></div></div></section>;
}
