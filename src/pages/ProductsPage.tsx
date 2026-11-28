import { Link, useSearchParams } from 'react-router';
import { PageLayout } from '@/components/PageLayout';
import { CatalogGrid } from '@/components/organism/CatalogGrid';
import { ProductComparison } from '@/components/organism/ProductComparison';
import { useProductPricing } from '@/context/ProductPricingContext';
import { useI18n } from '@/i18n';
import { productBySku } from '@/i18n/products';
import { storefront, tr } from '@/i18n/storefront';

export function ProductCatalogPage({category}:{category?:'feeder'|'water'}){
 const {products}=useProductPricing();const {locale,t}=useI18n();const [params]=useSearchParams();const query=params.get('q')?.trim()??'';const needle=query.toLowerCase();
 const title=category==='feeder'?t('feeders'):category==='water'?t('fountains'):t('products');
 const items=products.filter(p=>!category||p.category===category).filter(p=>!needle||[p.slug,p.name,p.tagline,productBySku(p.slug,locale)?.name??'',productBySku(p.slug,locale)?.tagline??''].some(text=>text.toLowerCase().includes(needle)));
 const links=[{label:t('products'),href:'/products',active:!category},{label:t('feeders'),href:'/products/feeders',active:category==='feeder'},{label:t('fountains'),href:'/products/water-dispensers',active:category==='water'},{label:tr(locale,'耗材配件','Accessories','อุปกรณ์เสริม'),href:'/products/accessories',active:false}];
 return <PageLayout title={title} subtitle={storefront.collection[locale]} breadcrumbs={[{label:t('products'),href:category?'/products':undefined},...(category?[{label:title}]:[])]}><nav className="mb-6 flex flex-wrap gap-2">{links.map(l=><Link key={l.href} to={l.href} aria-current={l.active?'page':undefined} className={`rounded-full border px-4 py-2 text-sm ${l.active?'bg-primary text-white':'bg-white hover:bg-muted'}`}>{l.label}</Link>)}</nav>{query&&<div className="mb-5 flex items-center gap-3"><span className="min-w-0 break-all text-sm">{tr(locale,'搜尋結果','Search results','ผลการค้นหา')}: {query}</span><Link to="/products" className="shrink-0 text-sm text-primary underline">{tr(locale,'清除','Clear','ล้าง')}</Link></div>}<CatalogGrid items={items}/>{category&&<ProductComparison/>}</PageLayout>;
}
export default function ProductsPage(){return <ProductCatalogPage/>;}
