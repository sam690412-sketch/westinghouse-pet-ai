import {useEffect,useState} from 'react';
import {Heading} from '@/components/atomic/Typography';
import type {AdminRole} from '@/config/adminPermissions';
interface Approval {id:string;action_type:string;status:string;requester_id:string;requester_role:string;created_at:string;before_value:unknown;after_value:unknown;reason:string;reviewer_id?:string;reviewed_at?:string}
export default function AdminApprovals(){
 const [role,setRole]=useState<AdminRole|null>(null);
 useEffect(()=>{fetch('/api/admin/me',{credentials:'same-origin'}).then(r=>r.ok?r.json():null).then(u=>setRole(u?.role||null)).catch(()=>setRole(null))},[]);
 const [items,setItems]=useState<Approval[]>([]);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const headers=()=>({'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'});
 async function load(){try{const r=await fetch('/api/admin/approvals',{headers:headers(),credentials:'same-origin'});const j=await r.json();if(!r.ok)throw Error(j.error||'讀取失敗');setItems(j.data||[])}catch(e){setError(String(e))}}
 useEffect(()=>{void load()},[]);
 async function decide(id:string,decision:'approve'|'reject'){if(role!=='super_admin')return;const note=prompt('請填寫審批原因或備註');if(!note?.trim())return;setBusy(true);try{const r=await fetch(`/api/admin/approvals/${id}/decision`,{method:'POST',headers:headers(),credentials:'same-origin',body:JSON.stringify({decision,note})});const j=await r.json();if(!r.ok)throw Error(j.error||'審批失敗');await load()}catch(e){setError(String(e))}finally{setBusy(false)}}
 return <div className="space-y-4"><Heading as="h1" variant="h2">待審批中心</Heading>{error&&<p role="alert" className="text-red-600">{error}</p>}{items.length===0&&<p>目前無審批紀錄，或審批 API 尚未啟用。</p>}{items.map(a=><article key={a.id} className="rounded-lg border p-4 space-y-2"><p><strong>{a.action_type}</strong> · {a.status}</p><p>申請人：{a.requester_id}（{a.requester_role}） · {a.created_at}</p><p>原因：{a.reason}</p><div className="grid gap-2 md:grid-cols-2"><pre className="overflow-auto bg-neutral-100 p-2 text-xs">Before: {JSON.stringify(a.before_value,null,2)}</pre><pre className="overflow-auto bg-neutral-100 p-2 text-xs">After: {JSON.stringify(a.after_value,null,2)}</pre></div>{role==='super_admin'&&a.status==='pending'&&<div className="flex gap-2"><button disabled={busy} onClick={()=>decide(a.id,'approve')} className="rounded bg-green-700 px-3 py-2 text-white">核准執行</button><button disabled={busy} onClick={()=>decide(a.id,'reject')} className="rounded bg-red-700 px-3 py-2 text-white">駁回</button></div>}</article>)}</div>
}
