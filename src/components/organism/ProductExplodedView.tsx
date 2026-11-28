import { useState } from 'react';
import type { PointerEvent } from 'react';
import { useI18n } from '@/i18n';
import { explodedViews, explodedLabels } from '@/data/explodedViews';

export interface ProductExplodedViewProps { slug: string }

export function ProductExplodedView({slug}: ProductExplodedViewProps) {
  const {locale} = useI18n();
  const [active, setActive] = useState<number | null>(null);
  const [tilt, setTilt] = useState({x: 0, y: 0});
  const [failed, setFailed] = useState(false);
  const data = explodedViews[slug];
  if (!data) return null;
  const part = active === null ? null : data.hotspots[active];
  const reset = () => { setActive(null); setTilt({x: 0, y: 0}); };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || active !== null || failed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTilt({x: (0.5 - (event.clientY - rect.top) / rect.height) * 10, y: ((event.clientX - rect.left) / rect.width - 0.5) * 10});
  };
  // Clamp translation so zoom never exposes an empty edge. Coordinates are relative to the actual portrait, not a square letterbox.
  const scale = part ? 1.55 : 1;
  const limit = (scale - 1) * 50;
  const clamp = (value: number) => Math.max(-limit, Math.min(limit, value));
  const tx = part ? clamp((50 - part.x) * scale) : 0;
  const ty = part ? clamp((50 - part.y) * scale) : 0;
  return (
    <section className="container-section py-12" aria-label={explodedLabels.title[locale]}>
      <h2 className="text-center text-3xl font-bold lg:text-4xl">{explodedLabels.title[locale]}</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">{explodedLabels.note[locale]}</p>
      <div className="mt-6 grid items-start gap-4 lg:mt-8 lg:gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="flex items-center justify-center rounded-2xl bg-neutral-950 p-3 sm:p-6" onPointerMove={move} onPointerLeave={() => setTilt({x:0,y:0})}>
          <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-xl" style={{aspectRatio: `${data.width} / ${data.height}`}}>
            {failed ? <p className="flex h-full items-center justify-center p-6 text-center text-white">{explodedLabels.unavailable[locale]}</p> : (
              <div className="exploded-motion absolute inset-0" style={{transform:`perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`}}>
                <div className="exploded-motion absolute inset-0" style={{transform:`translate(${tx}%, ${ty}%) scale(${scale})`}}>
                  <div className={`absolute inset-0 ${part ? '' : 'exploded-float'}`}>
                    <img src={data.image} width={data.width} height={data.height} alt={explodedLabels.title[locale]} className="h-full w-full object-contain" loading="lazy" decoding="async" onError={()=>setFailed(true)} />
                    {data.hotspots.map((hotspot, i) => (
                      <button key={i} type="button" aria-label={hotspot.title[locale]} aria-pressed={active === i}
                        className={`absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-orange-600 font-bold text-white shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 sm:h-9 sm:w-9 ${active===i ? 'ring-4 ring-orange-300' : 'exploded-hotspot'}`}
                        style={{left:`${hotspot.x}%`, top:`${hotspot.y}%`}}
                        onClick={()=>{setTilt({x:0,y:0});setActive(active===i ? null : i);}}>{i+1}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 sm:p-7">
          <p className="mb-4 text-sm text-muted-foreground">{explodedLabels.select[locale]}</p>
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1 lg:gap-2">
            {data.hotspots.map((hotspot,i)=>(
              <button key={i} type="button" disabled={failed} aria-pressed={active===i}
                className={`rounded-lg border px-2 py-2.5 text-left text-xs leading-snug transition-colors sm:text-sm lg:p-3 ${active===i ? 'border-orange-600 bg-orange-50 text-neutral-950' : 'border-border hover:border-orange-300'}`}
                onClick={()=>{setTilt({x:0,y:0});setActive(active===i?null:i);}}>{i+1}. {hotspot.title[locale]}</button>
            ))}
          </div>
          <div aria-live="polite" className="mt-3 min-h-[72px] lg:mt-5 lg:min-h-[100px] rounded-xl bg-muted/50 p-4">
            {part ? <><h3 className="font-semibold">{part.title[locale]}</h3><p className="mt-2 text-sm leading-relaxed">{part.description[locale]}</p></> : <p className="text-sm text-muted-foreground">{explodedLabels.select[locale]}</p>}
          </div>
          <button type="button" className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:border-orange-600" onClick={reset}>{explodedLabels.reset[locale]}</button>
        </div>
      </div>
    </section>
  );
}
