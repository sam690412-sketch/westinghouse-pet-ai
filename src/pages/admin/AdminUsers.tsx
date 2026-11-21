import {useEffect,useState} from 'react';
import {adminApi} from '@/lib/adminApi';
import {ROLE_LABELS,type AdminRole} from '@/config/adminPermissions';
type User={id:string;email:string;display_name:string;role:AdminRole};
export default function AdminUsers(){const [users,setUsers]=useState<User[]>([]);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
const load=async()=>{try{const j=await adminApi('/api/admin/users');setUsers(j.data)}catch(e){setError(String(e))}};
useEffect(()=>{void load()},[]);
async function change(u:User,role:AdminRole){const reason=prompt('角色變更原因（至少3字）');if(!reason)return;setBusy(true);try{const j=await adminApi(`/api/admin/users/${u.id}/role`,{method:'PATCH',body:JSON.stringify({role,reason})});alert(j.status==='pending'?'已送審':'已套用');await load()}catch(e){setError(String(e))}finally{setBusy(false)}}
return <main className="space-y-4"><h1 className="text-2xl font-bold">後台人員權限</h1>{error&&<p role="alert">{error}</p>}{users.map(u=><div key={u.id} className="border p-4 rounded flex flex-wrap gap-3 items-center"><span>{u.email} — {ROLE_LABELS[u.role]}</span><select disabled={busy} value={u.role} onChange={e=>void change(u,e.target.value as AdminRole)}>{Object.entries(ROLE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>)}</main>}
