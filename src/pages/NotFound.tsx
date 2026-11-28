import { Link } from 'react-router';
import { useI18n } from '@/i18n';
import { tr } from '@/i18n/storefront';
export default function NotFound(){const {locale,t}=useI18n();return <main className="container-section flex min-h-[60vh] flex-col items-center justify-center text-center"><p className="text-8xl font-bold text-neutral-200">404</p><h1 className="mt-4 text-2xl font-bold">{tr(locale,'找不到頁面','Page not found','ไม่พบหน้า')}</h1><Link to="/" className="mt-6 rounded-full bg-primary px-6 py-3 text-white">{t('home')}</Link></main>;}
