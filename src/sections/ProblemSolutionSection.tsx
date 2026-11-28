import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { launchGuides } from '@/i18n/launchContent';
import { useI18n } from '@/i18n';
import { tr } from '@/i18n/storefront';
export function ProblemSolutionSection(){const {locale,t}=useI18n();return <section className="py-12"><div className="container-section"><h2 className="mb-3 text-center text-3xl font-bold">{t('guides')}</h2><p className="mb-8 text-center text-sm text-muted-foreground">{tr(locale,'從每一天的照護需求出發。','Start with your everyday care needs.','เริ่มจากความต้องการดูแลในแต่ละวัน')}</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{launchGuides.map(item=><Link key={item.slug} to={`/solutions/${item.slug}`} className="group rounded-2xl border p-5 hover:shadow-md"><h3 className="font-semibold group-hover:text-primary">{item.label[locale]}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.intro[locale]}</p><ArrowRight className="mt-4 text-primary" size={19}/></Link>)}</div></div></section>;}
