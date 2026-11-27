import { useI18n } from '@/i18n';
import { productCopy, modelOrder } from '@/i18n/products';
export function ProductComparison(){
 const {locale,t}=useI18n();
 const models=modelOrder;
 return <section className="container-section py-12"><h2 className="mb-6 text-center text-3xl font-bold">{t('specs')}</h2><div className="overflow-x-auto"><table className="w-full min-w-[850px] border-collapse text-sm"><thead><tr>{models.map(m=><th key={m} className="border p-4 text-left">{productCopy[m][locale].name}</th>)}</tr></thead><tbody><tr>{models.map(m=><td key={m} className="border p-4 align-top"><dl>{productCopy[m][locale].specs.map(([k,v])=><div key={k} className="mb-3"><dt className="font-semibold">{k}</dt><dd>{v}</dd></div>)}</dl><ul className="list-disc pl-4">{productCopy[m][locale].features.map(f=><li key={f}>{f}</li>)}</ul></td>)}</tr></tbody></table></div><p className="mt-3 text-sm text-muted-foreground">{t('disclaimer')}</p></section>;
}
