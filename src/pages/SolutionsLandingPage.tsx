import { Link } from 'react-router';
import { PageLayout } from '@/components/PageLayout';
import { useI18n } from '@/i18n';
import { launchGuides } from '@/i18n/launchContent';
export default function SolutionsLandingPage(){const {locale,t}=useI18n();return <PageLayout title={t('guides')} breadcrumbs={[{label:t('guides')}] }><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{launchGuides.map(x=><Link to={`/solutions/${x.slug}`} key={x.slug} className="rounded-2xl border bg-white p-6 hover:shadow-lg"><h2 className="font-bold text-lg">{x.label[locale]}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{x.intro[locale]}</p><span className="mt-4 inline-flex text-sm font-medium text-primary">{t('explore')}</span></Link>)}</div></PageLayout>;}
