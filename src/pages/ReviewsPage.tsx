import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { useI18n } from '@/i18n';
import { REVIEWS, reviewLabels } from '@/data/reviews';
import { AuthenticReviewsSection } from '@/sections/AuthenticReviewsSection';
import { useProductPricing } from '@/context/ProductPricingContext';
import { CatalogGrid } from '@/components/organism/CatalogGrid';
import { tr } from '@/i18n/storefront';
export default function ReviewsPage(){const {locale}=useI18n();const labels=reviewLabels[locale];const {products}=useProductPricing();return <main className="min-h-screen bg-neutral-50"><div className="container-section py-5"><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/>{labels.back}</Link></div>{REVIEWS.length?<AuthenticReviewsSection showAllLink={false}/>:<p className="container-section py-12">{labels.empty}</p>}<section className="container-section py-12"><h2 className="mb-6 text-center text-2xl font-bold">{tr(locale,'探索商品','Explore the collection','สำรวจสินค้า')}</h2><CatalogGrid items={products} compact/></section></main>;}
