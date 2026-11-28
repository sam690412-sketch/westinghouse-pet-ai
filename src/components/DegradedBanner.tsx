import { useEffect, useState } from 'react';
import { env } from '@/lib/env';
import { useI18n } from '@/i18n';
import { isBackendHealthy, tr } from '@/i18n/storefront';
import { WifiOff, RefreshCw } from 'lucide-react';

type Status = 'checking' | 'healthy' | 'unavailable';

/** The storefront uses Render's API/PostgreSQL; browser Supabase is optional. */
export function DegradedBanner() {
  const { locale } = useI18n();
  const [status, setStatus] = useState<Status>('checking');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let disposed = false;
    let running = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let active: AbortController | undefined;
    async function check() {
      if (disposed || running) return;
      running = true;
      let healthy = false;
      // Allow cold-start time on the free QA instance, then confirm failure.
      for (let attempt = 0; attempt < 2 && !disposed; attempt++) {
        active = new AbortController();
        const timeout = setTimeout(() => active?.abort(), 35_000);
        try {
          const response = await fetch(`${env.API_BASE.replace(/\/$/, '')}/health`, {
            method: 'GET', cache: 'no-store', signal: active.signal,
          });
          healthy = isBackendHealthy(response.status, await response.json());
        } catch { healthy = false; }
        finally { clearTimeout(timeout); }
        if (healthy) break;
      }
      running = false;
      if (disposed) return;
      setStatus(healthy ? 'healthy' : 'unavailable');
      timer = setTimeout(check, 60_000);
    }
    const wake = () => { if (timer) clearTimeout(timer); void check(); };
    window.addEventListener('online', wake);
    void check();
    return () => { disposed = true; active?.abort(); if (timer) clearTimeout(timer); window.removeEventListener('online', wake); };
  }, [retry]);
  if (status !== 'unavailable') return null;
  return <div role="status" className="border-b border-amber-200 bg-amber-50 text-amber-900">
    <div className="container-section flex flex-wrap items-center gap-3 py-3 text-sm">
      <WifiOff className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <strong>{tr(locale,'目前服務連線不穩定','Service temporarily unavailable','บริการขัดข้องชั่วคราว')}</strong>
        <p>{tr(locale,'商品及預約資料可能暫時無法取得，請重新檢查連線。','Product and reservation data may be unavailable. Retry the connection.','อาจไม่สามารถโหลดข้อมูลสินค้าและรายการจองได้ โปรดลองเชื่อมต่ออีกครั้ง')}</p>
      </div>
      <button type="button" className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-2" onClick={()=>{setStatus('checking');setRetry(v=>v+1);}}><RefreshCw size={15}/>{tr(locale,'重新檢查','Retry','ลองอีกครั้ง')}</button>
    </div>
  </div>;
}
export default DegradedBanner;
