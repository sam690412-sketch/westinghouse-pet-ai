import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useI18n } from '@/i18n';
import { storefront, tr } from '@/i18n/storefront';
export function CTASection(){const {locale,t}=useI18n();return <section className="bg-[#10253c] py-14 text-center text-white"><div className="container-section"><h2 className="text-3xl font-bold">{tr(locale,'為毛孩準備，更好的每一天。','A better everyday routine for your pet.','เตรียมทุกวันให้ดีขึ้นสำหรับสัตว์เลี้ยงของคุณ')}</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80">{storefront.noPayment[locale]} {storefront.terms[locale]}</p><Link to="/products" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#10253c]">{t('products')}<ArrowRight size={18}/></Link></div></section>;}
