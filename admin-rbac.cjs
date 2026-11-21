'use strict';
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {Client}=require('pg');
const DB=process.env.DATABASE_URL || process.env.DATABASE_URI;
const SIGNING_KEY=process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SIGNING_KEY;
const secure=process.env.NODE_ENV==='production';
const permissions={
 super_admin:['*'],operations_manager:['products.read','prices.write','inventory.write','orders.read','refund.request','settings.request','approvals.read'],
 marketing_editor:['content.write'],customer_support:['orders.read','tickets.write','warranties.write']};
const client=()=>new Client({connectionString:DB,ssl:process.env.PGSSLMODE==='disable'?false:{rejectUnauthorized:false}});
async function tx(fn){const c=client();await c.connect();try{await c.query('BEGIN');const out=await fn(c);await c.query('COMMIT');return out}catch(e){await c.query('ROLLBACK');throw e}finally{await c.end()}}
async function q(sql,values=[]){const c=client();await c.connect();try{return await c.query(sql,values)}finally{await c.end()}}
const hash=p=>{const salt=crypto.randomBytes(16).toString('hex');return salt+':'+crypto.scryptSync(p,salt,64).toString('hex')};
function verify(p,stored){if(typeof stored!=='string'||!stored.includes(':'))return false;const [salt,h]=stored.split(':');const actual=crypto.scryptSync(p,salt,64);const expected=Buffer.from(h,'hex');return expected.length===actual.length&&crypto.timingSafeEqual(actual,expected)}
function sign(payload){const body=Buffer.from(JSON.stringify(payload)).toString('base64url');const sig=crypto.createHmac('sha256',SIGNING_KEY).update(body).digest('base64url');return body+'.'+sig}
function readToken(raw){if(!SIGNING_KEY||!raw)return null;const [body,sig]=raw.split('.');if(!body||!sig)return null;const correct=crypto.createHmac('sha256',SIGNING_KEY).update(body).digest('base64url');const a=Buffer.from(sig),b=Buffer.from(correct);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;try{const p=JSON.parse(Buffer.from(body,'base64url').toString());return p.exp>Date.now()?p:null}catch{return null}}
const reply=(status,data,headers={})=>({status,data,headers});
async function setup(){if(!DB||!SIGNING_KEY||SIGNING_KEY.length<32)throw Error('DATABASE_URI and strong ADMIN_SESSION_SIGNING_KEY required');
 const c=client();await c.connect();try{await c.query(fs.readFileSync(path.join(__dirname,'migrations/20261121_admin_rbac_approvals.sql'),'utf8'));await c.query(fs.readFileSync(path.join(__dirname,'migrations/20261121_approved_tw_prices.sql'),'utf8'));}finally{await c.end()}
 const email=process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL?.toLowerCase().trim(),password=process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD;
 if(email&&password&&password.length>=14){await q("INSERT INTO admin_users(email,password_hash,display_name,role) VALUES($1,$2,'Bootstrap Admin','super_admin') ON CONFLICT(email) DO NOTHING",[email,hash(password)])}
}
async function actor(req){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('wh_admin='))?.slice(9);const token=readToken(raw);if(!token)return null;const r=await q('SELECT id,email,role,is_active,session_version FROM admin_users WHERE id=$1',[token.id]);const a=r.rows[0];return a&&a.is_active&&a.session_version===token.v?a:null}
function requirePermission(a,key){return !!a&&(permissions[a.role]||[]).includes('*')||(!!a&&(permissions[a.role]||[]).includes(key))}
async function before(c,type,id){if(type==='price_change'){const r=await c.query('SELECT sku,msrp_twd,retail_twd,promo_twd FROM product_prices WHERE sku=$1 FOR UPDATE',[id]);return r.rows[0]||null}
 if(type==='store_setting'){const r=await c.query('SELECT key,value FROM store_settings WHERE key=$1 FOR UPDATE',[id]);return r.rows[0]||null}
 if(type==='stock_adjustment'){const r=await c.query('SELECT sku,stock_quantity FROM commerce_products WHERE sku=$1 FOR UPDATE',[id]);return r.rows[0]||null}
 if(type==='role_change'){const r=await c.query('SELECT id,role FROM admin_users WHERE id::text=$1 FOR UPDATE',[id]);return r.rows[0]||null}
 return null}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
async function apply(c,type,id,after){switch(type){
 case 'price_change':{const {msrp_twd,retail_twd,promo_twd}=after;if(![msrp_twd,retail_twd,promo_twd].every(n=>Number.isSafeInteger(n)&&n>0)||msrp_twd<retail_twd||retail_twd<promo_twd)throw Error('Invalid prices');await c.query('UPDATE product_prices SET msrp_twd=$1,retail_twd=$2,promo_twd=$3,updated_at=now() WHERE sku=$4',[msrp_twd,retail_twd,promo_twd,id]);break}
 case 'store_setting':{if(!['IS_LIVE_STORE','enabled_locales'].includes(id))throw Error('Unknown setting');if(id==='IS_LIVE_STORE'&&typeof after.value!=='boolean')throw Error('Invalid store setting');if(id==='IS_LIVE_STORE'&&after.value===true)throw Error('Live checkout requires separately verified release gate');await c.query('UPDATE store_settings SET value=$1::jsonb,updated_at=now() WHERE key=$2',[JSON.stringify(after.value),id]);break}
 case 'stock_adjustment':{if(!Number.isSafeInteger(after.stock_quantity)||after.stock_quantity<0)throw Error('Invalid quantity');await c.query("UPDATE commerce_products SET stock_quantity=$1,stock_status=CASE WHEN $1=0 THEN 'out_of_stock' WHEN $1<=5 THEN 'low_stock' ELSE 'in_stock' END,updated_at=now() WHERE sku=$2",[after.stock_quantity,id]);break}
 case 'role_change':{if(!permissions[after.role])throw Error('Invalid role');await c.query('UPDATE admin_users SET role=$1,session_version=session_version+1 WHERE id::text=$2',[after.role,id]);break}
 default:throw Error('Operation requires a verified provider integration');}}
async function requestChange(a,type,id,after,reason,direct=false){if(typeof reason!=='string'||reason.trim().length<3)return reply(400,{error:'Reason required'});
 return tx(async c=>{const old=await before(c,type,id);if(!old)return reply(404,{error:'Target not found'});
 if(direct&&a.role==='super_admin'){await apply(c,type,id,after);await c.query('INSERT INTO admin_audit_logs(action_type,target_type,target_id,before_value,after_value,requested_by,approved_by) VALUES($1,$2,$3,$4,$5,$6,$6)',[type,type,id,JSON.stringify(old),JSON.stringify(after),a.id]);return reply(200,{applied:true})}
 const r=await c.query('INSERT INTO admin_approval_requests(action_type,target_type,target_id,before_value,after_value,reason,requester_id,requester_role) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',[type,type,id,JSON.stringify(old),JSON.stringify(after),reason.trim(),a.id,a.role]);return reply(202,{id:r.rows[0].id,status:'pending'})})}
async function handle(req,pathname,body){
 // Double-submit-style custom header plus same-origin enforcement for cookie authenticated writes.
 if (pathname.startsWith('/api/admin/') && !['GET','HEAD','OPTIONS'].includes(req.method)) {
   if (req.headers['x-requested-with'] !== 'XMLHttpRequest') return reply(403,{error:'CSRF header required'});
   const host=req.headers['x-forwarded-host'] || req.headers.host;
   const origin=req.headers.origin;
   if (origin) {try {if(new URL(origin).host!==host) return reply(403,{error:'Cross-origin admin request blocked'});}catch{return reply(403,{error:'Invalid origin'})}}
   const fetchSite=req.headers['sec-fetch-site'];
   if(fetchSite && !['same-origin','none'].includes(fetchSite))return reply(403,{error:'Cross-site admin request blocked'});
 }
try{
 if(pathname==='/api/admin/login'&&req.method==='POST'){
  const email=String(body.email||'').toLowerCase().trim(),password=String(body.password||'');const r=await q('SELECT * FROM admin_users WHERE email=$1 AND is_active=true',[email]);const u=r.rows[0];if(!u||!verify(password,u.password_hash))return reply(401,{error:'Invalid credentials'});
  const token=sign({id:u.id,email:u.email,role:u.role,v:u.session_version,exp:Date.now()+8*3600_000});return reply(200,{id:u.id,email:u.email,role:u.role},{'Set-Cookie':`wh_admin=${token}; HttpOnly; SameSite=Lax; Path=/api/admin; Max-Age=28800${secure?'; Secure':''}`});}
 if(pathname==='/api/products/prices'&&req.method==='GET'){const r=await q('SELECT sku,name_zh_tw,msrp_twd,retail_twd,promo_twd FROM product_prices ORDER BY sku');return reply(200,{data:r.rows})}
 if(!pathname.startsWith('/api/admin/'))return null;
 const a=await actor(req);if(!a)return reply(401,{error:'Login required'});
 if(pathname==='/api/admin/me')return reply(200,{id:a.id,email:a.email,role:a.role});
 if(pathname==='/api/admin/logout'&&req.method==='POST')return reply(200,{ok:true},{'Set-Cookie':`wh_admin=; HttpOnly; SameSite=Lax; Path=/api/admin; Max-Age=0${secure?'; Secure':''}`});
 if(pathname==='/api/admin/products'&&req.method==='GET'){if(!requirePermission(a,'products.read'))return reply(403,{error:'Forbidden'});const r=await q('SELECT * FROM product_prices ORDER BY sku');return reply(200,{data:r.rows})}
 if(pathname==='/api/admin/users'&&req.method==='GET'){if(a.role!=='super_admin')return reply(403,{error:'Forbidden'});const r=await q('SELECT id,email,display_name,role,is_active FROM admin_users ORDER BY email');return reply(200,{data:r.rows})}
 if(pathname==='/api/admin/approvals'&&req.method==='GET'){if(!requirePermission(a,'approvals.read'))return reply(403,{error:'Forbidden'});const r=await q('SELECT * FROM admin_approval_requests ORDER BY created_at DESC LIMIT 200');return reply(200,{data:r.rows})}
 const price=pathname.match(/^\/api\/admin\/products\/([^/]+)\/price$/);if(price&&req.method==='PATCH'){if(!requirePermission(a,'prices.write'))return reply(403,{error:'Forbidden'});return requestChange(a,'price_change',decodeURIComponent(price[1]),{msrp_twd:body.msrp_twd,retail_twd:body.retail_twd,promo_twd:body.promo_twd},body.reason,body.direct===true)}
 if(pathname==='/api/admin/store-config'&&req.method==='PATCH'){if(!requirePermission(a,'settings.request')&&a.role!=='super_admin')return reply(403,{error:'Forbidden'});return requestChange(a,'store_setting',body.key,{key:body.key,value:body.value},body.reason,body.direct===true)}
 if(pathname==='/api/admin/inventory/adjust'&&req.method==='POST'){if(!requirePermission(a,'inventory.write'))return reply(403,{error:'Forbidden'});return requestChange(a,'stock_adjustment',body.sku,{sku:body.sku,stock_quantity:body.newQuantity},body.reason,body.direct===true)}
 const role=pathname.match(/^\/api\/admin\/users\/([^/]+)\/role$/);if(role&&req.method==='PATCH'){if(a.role!=='super_admin')return reply(403,{error:'Forbidden'});return requestChange(a,'role_change',role[1],{id:role[1],role:body.role},body.reason,body.direct===true)}
 if(/^\/api\/admin\/orders\/[^/]+\/refund$/.test(pathname)&&req.method==='POST')return reply(501,{error:'Refund provider integration unavailable; no money moved'});
 const decision=pathname.match(/^\/api\/admin\/approvals\/([^/]+)\/decision$/);if(decision&&req.method==='POST'){
 if(a.role!=='super_admin')return reply(403,{error:'Forbidden'});if(!['approve','reject'].includes(body.decision))return reply(400,{error:'Invalid decision'});
 return tx(async c=>{const r=await c.query('SELECT * FROM admin_approval_requests WHERE id=$1 FOR UPDATE',[decision[1]]);const item=r.rows[0];if(!item)return reply(404,{error:'Not found'});if(item.status!=='pending')return reply(409,{error:'Already decided'});if(item.requester_id===a.id)return reply(403,{error:'Self-approval forbidden'});
 const current=await before(c,item.action_type,item.target_id);if(!same(current,item.before_value))return reply(409,{error:'Stale request: underlying value changed'});
 if(body.decision==='approve')await apply(c,item.action_type,item.target_id,item.after_value);
 await c.query('UPDATE admin_approval_requests SET status=$1,reviewer_id=$2,review_note=$3,reviewed_at=now() WHERE id=$4',[body.decision==='approve'?'approved':'rejected',a.id,String(body.note||''),item.id]);
 await c.query('INSERT INTO admin_audit_logs(action_type,target_type,target_id,before_value,after_value,requested_by,approved_by,request_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[item.action_type,item.target_type,item.target_id,JSON.stringify(item.before_value),JSON.stringify(item.after_value),item.requester_id,a.id,item.id]);return reply(200,{status:body.decision})})}
 return reply(404,{error:'Admin route not implemented'});
 }catch(e){console.error('RBAC:',e.message);return reply(500,{error:'Admin operation failed'})}}
module.exports={setup,handle,requirePermission};
