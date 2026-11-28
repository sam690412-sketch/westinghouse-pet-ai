'use strict';
// This module is called only after cookie/session validation and admin CSRF checks.
// All queries use the existing application role; no new public endpoint or DB grant.
const MODELS = Object.freeze({
  'm81-fresh-food-feeder':'M81', 'm12-panoramic-feeder':'M12',
  'm31-gashapon-feeder':'M31', 'd61-stainless-dispenser':'D61',
  'd11ba-water-dispenser':'D11-BA',
});
const TRANSITIONS = Object.freeze({
  new:['pending_contact','contacted','cancelled'], pending_contact:['contacted','cancelled'],
  contacted:['pending_contact','confirmed','cancelled'], confirmed:['cancelled'], cancelled:[],
});
const BASE='/api/admin/reservations';
const SELECT='SELECT id::text AS id, name, email, contact, region, locale, items, status, revision, created_at, updated_at FROM public.early_bird_reservations';
const respond=(status,data)=>({status,data,headers:{'Cache-Control':'no-store, private'}});
class InputError extends Error {}
function dateValue(v) {
  if(!/^20\d{2}-\d{2}-\d{2}$/.test(v)) throw new InputError('日期格式不正確');
  const d=new Date(v+'T00:00:00Z');
  if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==v)throw new InputError('日期不存在');
  return v;
}
function filters(input) {
  const allowed=['status','model','locale','q','from','to'];
  const f={};
  for(const k of allowed) {
    const v=input[k];
    if(v===undefined||v==='')continue;
    if(typeof v!=='string')throw new InputError('篩選格式不正確');
    f[k]=v.trim();
    if(!f[k]) delete f[k];
  }
  if(f.status&&!Object.hasOwn(TRANSITIONS,f.status))throw new InputError('狀態不正確');
  if(f.model&&!Object.hasOwn(MODELS,f.model))throw new InputError('商品不正確');
  if(f.locale&&!['zh-TW','en','th'].includes(f.locale))throw new InputError('語言不正確');
  if(f.q&&(f.q.length>100||/\x00/.test(f.q)))throw new InputError('搜尋字串不正確');
  if(f.from)dateValue(f.from);if(f.to)dateValue(f.to);
  if(f.from&&f.to&&f.from>f.to)throw new InputError('開始日期不得晚於結束日期');
  return f;
}
function whereFor(f) {
  const parts=[],values=[];
  const add=(v,build)=>{values.push(v);parts.push(build('$'+values.length));};
  if(f.status)add(f.status,p=>`status=${p}`);
  if(f.model)add(JSON.stringify([{sku:f.model}]),p=>`items @> ${p}::jsonb`);
  if(f.locale)add(f.locale,p=>`locale=${p}`);
  if(f.q)add(f.q,p=>`(strpos(lower(name),lower(${p}))>0 OR strpos(lower(email),lower(${p}))>0 OR strpos(lower(contact),lower(${p}))>0 OR strpos(lower(region),lower(${p}))>0 OR id::text=${p})`);
  if(f.from)add(f.from,p=>`created_at >= (${p}::date::timestamp AT TIME ZONE 'Asia/Taipei')`);
  if(f.to)add(f.to,p=>`created_at < ((${p}::date+1)::timestamp AT TIME ZONE 'Asia/Taipei')`);
  return {where:parts.length?' WHERE '+parts.join(' AND '):'',values};
}
function boundedInt(v,fallback,max) {
  if(v===undefined||v==='')return fallback;
  if(typeof v!=='string'||!/^\d{1,7}$/.test(v)||+v<1||+v>max)throw new InputError('分頁參數不正確');
  return +v;
}
function csvCell(v) {
  let s=String(v??'');
  // Prevent spreadsheet formula execution even after leading whitespace/control chars.
  if(/^[\s\uFEFF\u200B]*[=+\-@]/u.test(s)||/^[\t\r\n]/.test(s))s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
}
function toCsv(rows) {
  const columns=['id','name','email','contact','region','locale','items','status','created_at','updated_at'];
  return '\uFEFF'+[columns.map(csvCell).join(','),...rows.map(r=>columns.map(k=>csvCell(k==='items'?JSON.stringify(r[k]):r[k] instanceof Date?r[k].toISOString():r[k])).join(','))].join('\r\n')+'\r\n';
}
async function audit(c,actor,action,id,before,after) {
  await c.query(`INSERT INTO public.admin_audit_logs(action_type,target_type,target_id,before_value,after_value,requested_by)
    VALUES ($1,'early_bird_reservations',$2,$3::jsonb,$4::jsonb,$5)`,[action,id,JSON.stringify(before),JSON.stringify(after),actor.id]);
}
function createReservationAdmin({q,tx,requirePermission}) {
  return async function reservationAdmin(req,pathname,body,actor) {
    if(pathname!==BASE&&!pathname.startsWith(BASE+'/'))return null;
    if(!actor)return respond(401,{error:'Login required'});
    const can=p=>requirePermission(actor,p);
    try {
      if(pathname===BASE+'/summary'&&req.method==='GET') {
        if(!can('reservations.stats'))return respond(403,{error:'Forbidden'});
        return await tx(async c=>{
          await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
          const totals=await c.query(`SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE created_at >= (date_trunc('day',now() AT TIME ZONE 'Asia/Taipei') AT TIME ZONE 'Asia/Taipei'))::int AS today,
            COUNT(*) FILTER (WHERE status IN ('new','pending_contact'))::int AS awaiting_contact,
            COUNT(*) FILTER (WHERE status='confirmed')::int AS confirmed,
            COUNT(*) FILTER (WHERE status='contacted')::int AS contacted,
            COUNT(*) FILTER (WHERE status='cancelled')::int AS cancelled
            FROM public.early_bird_reservations`);
          const demand=await c.query(`SELECT e->>'sku' AS sku,
            SUM(CASE WHEN (e->>'quantity') ~ '^[1-9][0-9]?$' THEN (e->>'quantity')::int ELSE 0 END)::bigint AS quantity
            FROM public.early_bird_reservations r CROSS JOIN LATERAL jsonb_array_elements(
              CASE WHEN jsonb_typeof(r.items)='array' THEN r.items ELSE '[]'::jsonb END) e
            WHERE r.status <> 'cancelled' AND e->>'sku'=ANY($1::text[]) GROUP BY e->>'sku'`,[Object.keys(MODELS)]);
          const data=Object.entries(MODELS).map(([sku,model])=>({sku,model,quantity:Number(demand.rows.find(r=>r.sku===sku)?.quantity||0)}));
          return respond(200,{data:{...totals.rows[0],models:data},timezone:'Asia/Taipei'});
        });
      }
      if(pathname===BASE+'/search'&&req.method==='POST') {
        if(!can('reservations.read'))return respond(403,{error:'Forbidden'});
        if(!body||typeof body!=='object'||Array.isArray(body))throw new InputError('搜尋條件不正確');
        // Keep names, emails and phone numbers out of URLs and access-log paths.
        const f=filters(body), page=boundedInt(body.page,1,10000), limit=boundedInt(body.limit,25,50);
        const {where,values}=whereFor(f);
        return await tx(async c=>{
          await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
          const count=await c.query('SELECT COUNT(*)::int AS total FROM public.early_bird_reservations'+where,values);
          const data=await c.query(SELECT+where+` ORDER BY created_at DESC,id DESC LIMIT $${values.length+1} OFFSET $${values.length+2}`,[...values,limit,(page-1)*limit]);
          return respond(200,{data:data.rows,total:count.rows[0].total,page,limit});
        });
      }
      if(pathname===BASE+'/export'&&req.method==='POST') {
        if(!can('reservations.export'))return respond(403,{error:'Forbidden'});
        if(!body||typeof body!=='object'||Array.isArray(body))throw new InputError('匯出條件不正確');
        const f=filters(body), {where,values}=whereFor(f);
        return await tx(async c=>{
          const r=await c.query(SELECT+where+' ORDER BY created_at DESC,id DESC LIMIT 1001',values);
          if(r.rows.length>1000)return respond(422,{error:'超過 1,000 筆，請縮小日期或篩選範圍'});
          // The audit entry contains no customer PII or free-text search string.
          const {q:search,...safeFilters}=f;
          await audit(c,actor,'reservation_export','export',{}, {count:r.rows.length,filters:safeFilters,has_search:!!search});
          return respond(200,{csv:toCsv(r.rows),count:r.rows.length});
        });
      }
      if(pathname===BASE+'/export-history'&&req.method==='GET') {
        if(!can('reservations.audit'))return respond(403,{error:'Forbidden'});
        const r=await q(`SELECT l.id::text AS id,l.created_at,l.after_value->>'count' AS count,
          l.after_value->'filters' AS filters,l.after_value->'has_search' AS has_search,
          l.requested_by::text AS actor_id,COALESCE(NULLIF(u.display_name,''),'管理員') AS actor_name
          FROM public.admin_audit_logs l LEFT JOIN public.admin_users u ON u.id=l.requested_by
          WHERE l.target_type='early_bird_reservations' AND l.action_type='reservation_export'
          ORDER BY l.created_at DESC,l.id DESC LIMIT 100`);
        return respond(200,{data:r.rows});
      }
      const match=pathname.match(/^\/api\/admin\/reservations\/([1-9]\d{0,18})\/(status|history)$/);
      if(match) {
        const id=match[1]; if(BigInt(id)>9223372036854775807n)throw new InputError('預約編號不正確');
        if(match[2]==='history'&&req.method==='GET') {
          if(!can('reservations.read'))return respond(403,{error:'Forbidden'});
          const r=await q(`SELECT l.id::text AS id,l.created_at,l.before_value->>'status' AS before_status,
            l.after_value->>'status' AS after_status,l.after_value->>'reason' AS reason,
            l.requested_by::text AS actor_id,COALESCE(NULLIF(u.display_name,''),'管理員') AS actor_name
            FROM public.admin_audit_logs l LEFT JOIN public.admin_users u ON u.id=l.requested_by
            WHERE l.target_type='early_bird_reservations' AND l.target_id=$1 AND l.action_type='reservation_status'
            ORDER BY l.created_at DESC,l.id DESC LIMIT 100`,[id]);
          return respond(200,{data:r.rows});
        }
        if(match[2]==='status'&&req.method==='PATCH') {
          if(!can('reservations.manage'))return respond(403,{error:'Forbidden'});
          const {status,revision,reason}=body||{};
          if(typeof status!=='string'||!Object.hasOwn(TRANSITIONS,status)||!Number.isSafeInteger(revision)||revision<1||typeof reason!=='string'||reason.trim().length<3||reason.trim().length>240||/\x00/.test(reason))throw new InputError('請提供有效狀態、版本及 3–240 字處理原因');
          return await tx(async c=>{
            const current=(await c.query('SELECT status,revision FROM public.early_bird_reservations WHERE id=$1::bigint FOR UPDATE',[id])).rows[0];
            if(!current)return respond(404,{error:'找不到預約'});
            if(current.revision!==revision)return respond(409,{error:'資料已由其他人更新，請重新整理'});
            if(!TRANSITIONS[current.status]?.includes(status))return respond(409,{error:'不允許此狀態變更'});
            const r=await c.query(`UPDATE public.early_bird_reservations SET status=$2,revision=revision+1,updated_at=now(),updated_by=$3
              WHERE id=$1::bigint AND revision=$4 RETURNING status,revision,updated_at`,[id,status,actor.id,revision]);
            if(r.rowCount!==1)throw Error('Reservation update not confirmed');
            await audit(c,actor,'reservation_status',id,{status:current.status,revision},{status,revision:r.rows[0].revision,reason:reason.trim()});
            return respond(200,{data:r.rows[0]});
          });
        }
      }
      return respond(404,{error:'Reservation admin route not found'});
    } catch(e) {
      if(e instanceof InputError)return respond(400,{error:e.message});
      // Never log SQL parameters or PII.
      console.error('[RESERVATION ADMIN] Operation failed',typeof e?.code==='string'&&/^[A-Z0-9]{5}$/.test(e.code)?e.code:'UNKNOWN');
      return respond(503,{error:'預約管理暫時無法使用，請稍後重新整理'});
    }
  };
}
module.exports={createReservationAdmin,MODELS,TRANSITIONS,filters,whereFor,csvCell,toCsv};
