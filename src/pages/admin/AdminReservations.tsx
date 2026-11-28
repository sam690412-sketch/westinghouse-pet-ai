import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import { adminApi } from '@/lib/adminApi';
import { hasAdminPermission, type AdminRole } from '@/config/adminPermissions';

const models = {
  'm81-fresh-food-feeder': 'M81', 'm12-panoramic-feeder': 'M12',
  'm31-gashapon-feeder': 'M31', 'd61-stainless-dispenser': 'D61',
  'd11ba-water-dispenser': 'D11-BA',
} as const;
type Model = keyof typeof models;
const labels = { new:'新預約', pending_contact:'待聯絡', contacted:'已聯絡', confirmed:'已確認', cancelled:'已取消' } as const;
type Status = keyof typeof labels;
const transitions: Record<Status, readonly Status[]> = {
  new:['pending_contact','contacted','cancelled'], pending_contact:['contacted','cancelled'],
  contacted:['pending_contact','confirmed','cancelled'], confirmed:['cancelled'], cancelled:[],
};
interface Filters { q:string; status:string; model:string; locale:string; from:string; to:string }
const initialFilters: Filters = { q:'', status:'', model:'', locale:'', from:'', to:'' };
interface Reservation { id:string; name:string; email:string; contact:string; region:string; locale:string; items:{sku:string;quantity:number}[]; status:Status; revision:number; created_at:string; updated_at:string }
interface Summary { total:number; today:number; awaiting_contact:number; confirmed:number; contacted:number; cancelled:number; models:{sku:string;model:string;quantity:number}[] }
interface HistoryEntry { id:string; created_at:string; before_status:Status; after_status:Status; reason:string; actor_name:string; actor_id:string|null }
interface ExportEntry { id:string; created_at:string; count:string; filters:Partial<Filters>; has_search:boolean; actor_name:string; actor_id:string|null }
interface ListResponse { data:Reservation[]; total:number; page:number; limit:number }
const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900';
const primary = 'rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
const secondary = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 disabled:opacity-50';
function displayDate(date:string) { return new Intl.DateTimeFormat('zh-TW',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Taipei'}).format(new Date(date)); }
function modelName(sku:string) { return Object.hasOwn(models,sku) ? models[sku as Model] : '其他歷史品項'; }
function errorText(error:unknown) { return error instanceof Error ? error.message : '操作失敗，請重新整理。'; }

export default function AdminReservations() {
  const { role } = useOutletContext<{role:AdminRole}>();
  const canRead=hasAdminPermission(role,'reservations.read');
  const canManage=hasAdminPermission(role,'reservations.manage');
  const canExport=hasAdminPermission(role,'reservations.export');
  const canAudit=hasAdminPermission(role,'reservations.audit');
  const [summary,setSummary]=useState<Summary|null>(null);
  const [draft,setDraft]=useState<Filters>(initialFilters);
  const [applied,setApplied]=useState<Filters>(initialFilters);
  const [page,setPage]=useState(1);
  const [rows,setRows]=useState<Reservation[]>([]);
  const [total,setTotal]=useState(0);
  const [refresh,setRefresh]=useState(0);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [historyTarget,setHistoryTarget]=useState<Reservation|null>(null);
  const [history,setHistory]=useState<HistoryEntry[]|null>(null);
  const [historyError,setHistoryError]=useState('');
  const [exports,setExports]=useState<ExportEntry[]|null>(null);
  const editRef=useRef<HTMLFormElement>(null);
  const historyRef=useRef<HTMLElement>(null);
  const [editing,setEditing]=useState<Reservation|null>(null);
  const [nextStatus,setNextStatus]=useState<Status>('pending_contact');
  const [reason,setReason]=useState('');

  useEffect(()=>{
    let active=true; const controller=new AbortController();
    setLoading(true);setError('');setRows([]);setSummary(null);setTotal(0);
    async function load(){
      try {
        const requests: [Promise<{data:Summary}>,Promise<ListResponse|null>] = [
          adminApi('/api/admin/reservations/summary',{signal:controller.signal,cache:'no-store'}),
          canRead ? adminApi('/api/admin/reservations/search',{method:'POST',body:JSON.stringify({...applied,page:String(page),limit:'25'}),signal:controller.signal,cache:'no-store'}) : Promise.resolve(null),
        ];
        const [s,list]=await Promise.all(requests);
        if(!active)return;
        setSummary(s.data);if(list){setRows(list.data);setTotal(list.total);}
      } catch(e){if(active)setError(errorText(e));}
      finally{if(active)setLoading(false);}
    }
    void load(); return ()=>{active=false;controller.abort();};
  },[applied,page,refresh,canRead,role]);

  useEffect(()=>{
    if(!historyTarget||!canRead)return;
    let active=true;const controller=new AbortController();setHistory(null);setHistoryError('');
    adminApi(`/api/admin/reservations/${historyTarget.id}/history`,{signal:controller.signal,cache:'no-store'})
      .then((r:{data:HistoryEntry[]})=>{if(active)setHistory(r.data);})
      .catch((e:unknown)=>{if(active)setHistoryError(errorText(e));});
    return ()=>{active=false;controller.abort();};
  },[historyTarget,canRead,refresh]);

  useEffect(()=>{ if(editing)editRef.current?.scrollIntoView({block:'start',behavior:'smooth'}); },[editing]);
  useEffect(()=>{ if(historyTarget)historyRef.current?.scrollIntoView({block:'start',behavior:'smooth'}); },[historyTarget]);
  async function loadExportHistory(){
    if(!canAudit||busy)return;setBusy(true);setError('');
    try{const r:{data:ExportEntry[]}=await adminApi('/api/admin/reservations/export-history',{cache:'no-store'});setExports(r.data);}
    catch(e){setError(errorText(e));}finally{setBusy(false);}
  }
  async function exportCsv(){
    if(!canExport||busy||loading)return;
    if(!window.confirm('匯出包含聯絡資料的名單（最多 1,000 筆）。僅限授權營運使用，確認匯出？'))return;
    setBusy(true);setError('');setNotice('');
    try {
      const r:{csv:string;count:number}=await adminApi('/api/admin/reservations/export',{method:'POST',body:JSON.stringify(applied)});
      const url=URL.createObjectURL(new Blob([r.csv],{type:'text/csv;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download=`westinghouse-reservations-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setNotice(`已匯出 ${r.count} 筆並留下稽核紀錄。`);setExports(null);
    } catch(e){setError(errorText(e));}finally{setBusy(false);}
  }
  async function changeStatus(){
    if(!editing||!canManage||busy)return;
    if(!transitions[editing.status].includes(nextStatus)||reason.trim().length<3||reason.trim().length>240)return;
    setBusy(true);setError('');setNotice('');
    try {
      await adminApi(`/api/admin/reservations/${editing.id}/status`,{method:'PATCH',body:JSON.stringify({status:nextStatus,revision:editing.revision,reason:reason.trim()})});
      setEditing(null);setReason('');setNotice(`預約 #${editing.id} 已更新。`);setRefresh(n=>n+1);
    }catch(e){setError(errorText(e)+' 請重新整理後再試。');setEditing(null);}finally{setBusy(false);}
  }
  const units=summary?.models.reduce((sum,m)=>sum+m.quantity,0)??0;
  const pageCount=Math.max(1,Math.ceil(total/25));
  return <section className="mx-auto max-w-[1440px] space-y-5" aria-label="早鳥預約管理中心">
    <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-white p-5">
      <div><p className="text-xs font-semibold tracking-wider text-slate-500">WESTINGHOUSE PET · OPERATIONS</p><h1 className="mt-1 text-2xl font-bold text-slate-900">早鳥預約管理中心</h1><p className="mt-2 text-sm text-slate-600">統計以台灣時間計算；預約不是正式訂單，未收款。</p></div>
      <div className="flex flex-wrap gap-2"><button className={secondary} disabled={busy||loading} onClick={()=>setRefresh(n=>n+1)}>重新整理</button>{canAudit&&<button className={secondary} disabled={busy||loading} onClick={()=>void loadExportHistory()}>匯出稽核紀錄</button>}{canExport&&<button className={primary} disabled={busy||loading||!summary} onClick={()=>void exportCsv()}>匯出目前篩選 CSV</button>}</div>
    </header>
    {error&&<div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    {notice&&<p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {canAudit&&exports!==null&&<article className="space-y-2 rounded-xl border bg-white p-4"><div className="flex items-center justify-between"><h2 className="font-bold">最近100筆匯出稽核</h2><button className={secondary} onClick={()=>setExports(null)}>關閉</button></div>{exports.length===0&&<p>尚無匯出紀錄。</p>}{exports.map(e=><div key={e.id} className="border-t pt-2 text-sm"><p>{displayDate(e.created_at)} · {e.actor_name} · {e.count} 筆</p><p className="break-all text-xs text-slate-500">操作者 ID：{e.actor_id??'—'}；條件：{Object.entries(e.filters??{}).map(([k,v])=>`${k}: ${v}`).join(' / ')||'全部'}{e.has_search?'（含搜尋，關鍵字不記錄）':''}</p></div>)}</article>}
    {loading&&<p role="status" className="text-sm text-slate-500">正在讀取預約資料…</p>}
    {summary&&<>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[
        {label:'預約總數',value:summary.total},{label:'今日新增',value:summary.today},
        {label:'待聯絡（含新預約）',value:summary.awaiting_contact},{label:'已確認',value:summary.confirmed},
      ].map(k=><article key={k.label} className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">{k.label}</p><p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{k.value.toLocaleString('zh-TW')}</p></article>)}</div>
      <article className="rounded-xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold text-slate-900">五款機型預約需求</h2><p className="text-sm text-slate-500">{units.toLocaleString('zh-TW')} 台（不含取消）</p></div><div className="mt-4 space-y-3">{summary.models.map(m=>{const percent=units?m.quantity/units*100:0;return <div key={m.sku}><div className="flex justify-between text-sm"><span className="font-medium">{m.model}</span><span className="tabular-nums text-slate-600">{m.quantity} 台 · {percent.toFixed(1)}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-800" style={{width:`${percent}%`}}/></div></div>;})}</div><p className="mt-4 text-sm text-slate-500">已聯絡 {summary.contacted} 筆 · 已取消 {summary.cancelled} 筆</p></article>
    </>}
    {!canRead?<p className="rounded-lg border bg-white p-4 text-sm text-slate-600">本角色僅能查看彙總統計，不提供客戶名單、聯絡資料或匯出。</p>:<>
      <form className="space-y-3 rounded-xl border bg-white p-4" onSubmit={e=>{e.preventDefault();setPage(1);setApplied({...draft});setHistoryTarget(null);setEditing(null);}}>
        <h2 className="font-bold">預約名單</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-medium">搜尋（姓名、Email、聯絡方式、地區、編號）<input className={field} value={draft.q} maxLength={100} onChange={e=>setDraft(v=>({...v,q:e.target.value}))}/></label>
          <label className="text-sm font-medium">處理狀態<select className={field} value={draft.status} onChange={e=>setDraft(v=>({...v,status:e.target.value}))}><option value="">全部</option>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
          <label className="text-sm font-medium">商品機型<select className={field} value={draft.model} onChange={e=>setDraft(v=>({...v,model:e.target.value}))}><option value="">全部</option>{Object.entries(models).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
          <label className="text-sm font-medium">語言<select className={field} value={draft.locale} onChange={e=>setDraft(v=>({...v,locale:e.target.value}))}><option value="">全部</option><option value="zh-TW">繁體中文</option><option value="en">English</option><option value="th">ไทย</option></select></label>
          <label className="text-sm font-medium">開始日期<input type="date" className={field} value={draft.from} onChange={e=>setDraft(v=>({...v,from:e.target.value}))}/></label>
          <label className="text-sm font-medium">結束日期（含當日）<input type="date" className={field} value={draft.to} onChange={e=>setDraft(v=>({...v,to:e.target.value}))}/></label>
        </div>
        <div className="flex flex-wrap gap-2"><button type="submit" className={primary} disabled={loading||busy}>套用篩選</button><button type="button" className={secondary} disabled={busy} onClick={()=>{setDraft(initialFilters);setApplied({...initialFilters});setPage(1);setHistoryTarget(null);setEditing(null);}}>清除篩選</button></div>
        <p className="text-xs text-slate-500">匯出使用已套用篩選，非尚未送出的欄位。</p>
      </form>
      <div className="rounded-xl border bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><h2 className="font-semibold">符合條件：{total} 筆</h2><div className="flex items-center gap-2 text-sm"><button className={secondary} disabled={page<=1||busy||loading} onClick={()=>setPage(n=>n-1)}>上一頁</button><span>{page} / {pageCount}</span><button className={secondary} disabled={page>=pageCount||busy||loading} onClick={()=>setPage(n=>n+1)}>下一頁</button></div></div>
        {rows.length===0&&!loading&&!error&&<p className="p-6 text-sm text-slate-500">目前沒有符合條件的預約。</p>}
        <div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['編號 / 時間','客戶與聯絡方式','地區 / 語言','預約品項','狀態','處理'].map(h=><th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-t align-top"><td className="px-4 py-3"><p className="font-medium">#{r.id}</p><p className="mt-1 text-xs text-slate-500">{displayDate(r.created_at)}</p></td><td className="max-w-[250px] break-words px-4 py-3"><p className="font-medium">{r.name}</p><p>{r.email}</p><p>{r.contact}</p></td><td className="max-w-[150px] break-words px-4 py-3">{r.region}<p className="text-xs text-slate-500">{r.locale}</p></td><td className="px-4 py-3">{Array.isArray(r.items)&&r.items.map((i,n)=><p key={n}>{modelName(i.sku)} × {i.quantity}</p>)}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{labels[r.status]}</span></td><td className="space-y-2 px-4 py-3"><button className={secondary} onClick={()=>setHistoryTarget(r)} disabled={busy}>處理紀錄</button>{canManage&&transitions[r.status]?.length>0&&<button className={primary} disabled={busy} onClick={()=>{setEditing(r);setNextStatus(transitions[r.status][0]);setReason('');}}>更新狀態</button>}</td></tr>)}</tbody></table></div>
      </div>
      {editing&&canManage&&<form ref={editRef} className="space-y-3 rounded-xl border border-slate-300 bg-white p-5" onSubmit={e=>{e.preventDefault();void changeStatus();}}><h2 className="font-bold">處理預約 #{editing.id}（{labels[editing.status]}）</h2><label className="block text-sm font-medium">新狀態<select className={field} value={nextStatus} onChange={e=>setNextStatus(e.target.value as Status)}>{transitions[editing.status].map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></label><label className="block text-sm font-medium">處理原因（3–240 字，請勿輸入個資）<textarea className={field} minLength={3} maxLength={240} required value={reason} onChange={e=>setReason(e.target.value)}/></label><p className="text-xs text-slate-500">異動將寫入不可修改的稽核紀錄；已取消不能重新啟用。</p><div className="flex gap-2"><button className={primary} disabled={busy||reason.trim().length<3}>確認更新</button><button type="button" className={secondary} disabled={busy} onClick={()=>setEditing(null)}>取消操作</button></div></form>}
      {historyTarget&&<article ref={historyRef} className="rounded-xl border bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-bold">預約 #{historyTarget.id} 處理紀錄（最近100筆）</h2><button className={secondary} onClick={()=>setHistoryTarget(null)}>關閉</button></div>{historyError&&<p role="alert" className="text-red-700">{historyError}</p>}{!history&&!historyError&&<p role="status">讀取紀錄中…</p>}{history?.length===0&&<p className="mt-3 text-sm text-slate-500">尚無狀態異動。</p>}{history?.map(h=><div key={h.id} className="mt-3 border-t pt-3 text-sm"><p>{displayDate(h.created_at)} · {h.actor_name}{h.actor_id?` (${h.actor_id})`:''}</p><p className="font-medium">{labels[h.before_status]||h.before_status} → {labels[h.after_status]||h.after_status}</p><p className="break-words text-slate-600">{h.reason}</p></div>)}</article>}
    </>}
  </section>;
}
