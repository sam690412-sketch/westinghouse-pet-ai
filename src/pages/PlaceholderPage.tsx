import { Link, useParams } from 'react-router';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';
export default function PlaceholderPage(){const {locale,t}=useI18n();const {slug}=useParams<{slug:string}>();const title=slug==='warranty-register'?tr(locale,'保固登錄','Warranty registration','ลงทะเบียนรับประกัน'):slug==='repair-status'?tr(locale,'維修查詢','Repair status','สถานะการซ่อม'):tr(locale,'售後服務','After-sales service','บริการหลังการขาย');return <main className="container-section flex min-h-[60vh] flex-col items-center justify-center text-center"><h1 className="text-3xl font-bold">{title}</h1><p className="mt-4 text-muted-foreground">{storefront.support[locale]}</p><Link to="/faq" className="mt-5 text-primary underline">{t('faq')}</Link></main>;}
