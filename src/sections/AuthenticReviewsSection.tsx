import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { reviewsForProduct, reviewStats, reviewLabels, SHOW_PREVIEW_REVIEWS, previewAlbum, albumLabels } from '@/data/reviews';

export interface AuthenticReviewsSectionProps { limit?: number; productSlug?: string; showAllLink?: boolean }

export function AuthenticReviewsSection({limit, productSlug, showAllLink = true}: AuthenticReviewsSectionProps) {
  const {locale} = useI18n();
  const labels = reviewLabels[locale];
  const all = reviewsForProduct(productSlug);
  const stats = reviewStats(all);
  const album = previewAlbum(productSlug);
  const displayReviews = limit === undefined ? all : all.slice(0, Math.max(0, limit));
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  useEffect(() => {
    if (!lightboxImage) return;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') setLightboxImage(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxImage]);
  if (!displayReviews.length) return null;
  return (
    <section className="bg-neutral-50 section-py" aria-label={labels.heading}>
      <div className="container-section">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{SHOW_PREVIEW_REVIEWS ? labels.preview : labels.published}</p>
          <h2 className="mt-3 text-3xl font-bold lg:text-4xl">{labels.heading}</h2>
          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border bg-white px-5 py-3">
            <span className="text-3xl font-bold tabular-nums">{stats.avgRating.toFixed(2)}<span className="text-sm font-normal text-muted-foreground"> / 5</span></span>
            <div className="flex gap-0.5" aria-label={`${stats.avgRating}/5`}>
              {Array.from({length:5}, (_,i)=><Star key={i} aria-hidden="true" className={`h-5 w-5 ${i<Math.round(stats.avgRating)?'fill-amber-400 text-amber-400':'text-neutral-300'}`}/>)}
            </div>
            <span className="text-sm text-muted-foreground">{stats.totalCount} {labels.count} · {labels.five} {stats.fiveStarPercent}%</span>
          </div>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayReviews.map(review=>(
            <article key={review.id} className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${review.avatarColor || 'bg-neutral-100'}`}>{review.avatar}</div>
                <div><p className="font-semibold">{review.name}</p><p className="text-xs text-muted-foreground">{review.date}</p></div>
              </div>
              <p className="mt-3 text-sm font-semibold text-primary">{review.product}</p>
              <div className="mt-2 flex gap-0.5" aria-label={`${review.rating}/5`}>
                {Array.from({length:5}, (_,i)=><Star key={i} aria-hidden="true" className={`h-4 w-4 ${i<review.rating?'fill-amber-400 text-amber-400':'text-neutral-300'}`}/>)}
              </div>
              <p lang="zh-TW" className="mt-3 flex-1 text-sm leading-relaxed text-neutral-700">{review.content}</p>
              {!!review.photos?.length && <div className="mt-4 grid grid-cols-2 gap-2">{review.photos.map((photo,i)=>(
                <button key={photo} type="button" aria-label={`${labels.photos} ${i+1}`} className="overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:ring-primary" onClick={()=>setLightboxImage(photo)}>
                  <img src={photo} alt={`${labels.photos} ${i+1}`} className="aspect-[4/3] w-full object-cover" loading="lazy"/>
                </button>
              ))}</div>}
              {SHOW_PREVIEW_REVIEWS && <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">{labels.preview}</p>}
            </article>
          ))}
        </div>
        {!!album.length && <div className="mt-10">
          <h3 className="mb-4 text-xl font-bold">{albumLabels[locale]}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {album.map((photo, i)=><button key={photo} type="button" aria-label={`${albumLabels[locale]} ${i+1}`} className="overflow-hidden rounded-xl border bg-white" onClick={()=>setLightboxImage(photo)}><img src={photo} alt={`${albumLabels[locale]} ${i+1}`} className="aspect-[16/10] w-full object-cover" loading="lazy"/></button>)}
          </div>
        </div>}
        {showAllLink && <div className="mt-8 text-center"><Link to="/reviews" className="inline-flex rounded-full border bg-white px-6 py-3 text-sm font-semibold hover:border-primary">{labels.all}</Link></div>}
      </div>
      {lightboxImage && <div role="dialog" aria-modal="true" aria-label={labels.photos} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4" onClick={()=>setLightboxImage(null)}>
        <button autoFocus type="button" className="absolute right-4 top-4 rounded-full bg-white p-2 text-black" aria-label={labels.close} onClick={()=>setLightboxImage(null)}><X size={22}/></button>
        <img src={lightboxImage} alt={labels.photos} className="max-h-[85vh] max-w-full rounded-lg object-contain" onClick={event=>event.stopPropagation()}/>
      </div>}
    </section>
  );
}
