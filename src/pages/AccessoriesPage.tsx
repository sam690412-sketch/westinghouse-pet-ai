import { Link } from 'react-router';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/i18n';
import { tr } from '@/i18n/storefront';
import { PackageCheck } from 'lucide-react';
export default function AccessoriesPage(){const {locale,t}=useI18n();const title=tr(locale,'耗材配件','Accessories','อุปกรณ์เสริม');return <PageLayout title={title} breadcrumbs={[{label:t('products'),href:'/products'},{label:title}]}><div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center"><PackageCheck size={40} className="mx-auto mb-5 text-primary"/><h2 className="text-xl font-bold">{t('accessories')}</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t('noAccessories')}</p><Link to="/faq/filter-replacement" className="mt-5 inline-flex text-primary underline">{t('faq')}</Link></div></PageLayout>;}
