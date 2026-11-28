'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const {createReservationAdmin,MODELS,TRANSITIONS,csvCell,filters,whereFor}=require('../reservation-admin.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
function pass(name){passed++;console.log('PASS '+name)}
const A='00000000-0000-4000-8000-000000000001';
const row={id:'1',name:'=1+2',email:'qa@example.com',contact:'QA TEST',region:'Taiwan QA',locale:'zh-TW',items:[{sku:'m81-fresh-food-feeder',quantity:1}],status:'new',revision:1,created_at:'2026-11-28T00:00:00Z',updated_at:'2026-11-28T00:00:00Z'};
const base='/api/admin/reservations';
let queries=[],sessions=[],mode='normal',current={status:'new',revision:1},exportRows=[row],dbRow={id:A,email:'qa@example.com',role:'operations_manager',is_active:true,session_version:1};
async function query(sql,values=[]){queries.push({sql,values});
  if(/^SELECT id,email,role,is_active,session_version FROM admin_users/.test(sql))return {rows:[dbRow]};
  if(sql==='BEGIN'||sql==='COMMIT'||sql==='ROLLBACK'||sql.startsWith('SET TRANSACTION'))return {rows:[]};
  if(sql.includes('COUNT(*) FILTER'))return {rows:[{total:1,today:1,awaiting_contact:1,confirmed:0,contacted:0,cancelled:0}]};
  if(sql.includes('CROSS JOIN LATERAL'))return {rows:[{sku:'m81-fresh-food-feeder',quantity:'2'}]};
  if(sql.startsWith('SELECT COUNT(*)::int AS total'))return {rows:[{total:1}]};
  if(sql.includes('LIMIT 1001'))return {rows:exportRows};
  if(sql.startsWith('SELECT id::text AS id, name,'))return {rows:[row]};
  if(sql.includes('FOR UPDATE'))return {rows:current?[current]:[]};
  if(sql.startsWith('UPDATE public.early_bird_reservations'))return {rowCount:mode==='update_fail'?0:1,rows:[{status:values[1],revision:values[3]+1,updated_at:row.updated_at}]};
  if(sql.includes('INSERT INTO public.admin_audit_logs')){if(mode==='audit_fail')throw Object.assign(Error('mock'),{code:'XX000'});return {rowCount:1,rows:[]};}
  if(sql.includes('FROM public.admin_audit_logs'))return {rows:[]};
  throw Error('Unexpected mock query '+sql);
}
class Client{async connect(){sessions.push('connect')}async end(){sessions.push('end')}async query(sql,values){return query(sql,values)}}
const signingKey='qa-only-in-memory-key-never-deployed-1234567890';
const rbacSource=fs.readFileSync(path.join(root,'admin-rbac.cjs'),'utf8');
const mockModule={exports:{}};
vm.runInNewContext(rbacSource,{require:n=>n==='pg'?{Client}:n==='./qa-product-schema.cjs'?{PRICE_MAPPING:"('WH-M81-TW','M81')"}:n==='./reservation-admin.cjs'?{createReservationAdmin}:require(n),module:mockModule,exports:mockModule.exports,process:{env:{NODE_ENV:'production',DATABASE_URI:'mock',ADMIN_SESSION_SIGNING_KEY:signingKey}},Buffer,console,URL,__dirname:root});
const rbac=mockModule.exports;
function cookie(){const body=Buffer.from(JSON.stringify({id:A,v:1,exp:Date.now()+60000})).toString('base64url');return 'wh_admin='+body+'.'+crypto.createHmac('sha256',signingKey).update(body).digest('base64url')}
async function call(method,p,body={},role='operations_manager',options={}){queries=[];sessions=[];dbRow={id:A,email:'qa@example.com',role,is_active:true,session_version:1,...options.dbRow};const req={method,url:p,headers:{host:'qa.example.com',origin:'https://qa.example.com','sec-fetch-site':'same-origin','x-requested-with':'XMLHttpRequest',...(options.anonymous?{}:{cookie:cookie()}),...options.headers}};return rbac.handle(req,p,body)}
async function main(){
  assert.equal(Object.keys(MODELS).length,5);assert.deepEqual(TRANSITIONS.cancelled,[]);pass('five approved model aliases and terminal cancelled state');
  assert.throws(()=>filters({from:'2026-02-30'}));assert.throws(()=>filters({from:'2026-11-30',to:'2026-11-01'}));assert.throws(()=>filters({status:'foo'}));assert.throws(()=>filters({model:'bad'}));assert.throws(()=>filters({locale:'xx'}));assert.throws(()=>filters({q:'x'.repeat(101)}));pass('invalid status/model/locale/date/search rejected');
  const hostile="x' OR 1=1 --";const spec=whereFor(filters({q:hostile,model:'d11ba-water-dispenser',to:'2026-11-28'}));assert(!spec.where.includes(hostile));assert(spec.values.includes(hostile));assert(spec.where.includes('Asia/Taipei'));pass('parameterized search, model and Taiwan date filters');
  for(const text of ['=1+2',' +SUM(1)','-10','@SUM(1)','\t=1','\u200B=1'])assert(csvCell(text).startsWith('"\''));assert.equal(csvCell('a"b'),'"a""b"');pass('CSV formula injection and quote escaping');
  let r=await call('GET',base+'/summary',{},'operations_manager',{anonymous:true});assert.equal(r.status,401);assert.equal(queries.length,0);pass('anonymous denied before database access');
  r=await call('GET',base+'/summary',{},'operations_manager',{dbRow:{session_version:2}});assert.equal(r.status,401);pass('revoked session denied');
  r=await call('GET',base+'/summary',{},'operations_manager',{dbRow:{is_active:false}});assert.equal(r.status,401);pass('disabled user denied');
  r=await call('POST',base+'/search',{},'operations_manager',{headers:{'x-requested-with':undefined}});assert.equal(r.status,403);assert.equal(queries.length,0);pass('search requires same-origin admin CSRF header');
  r=await call('POST',base+'/export',{},'operations_manager',{headers:{origin:'https://evil.example'}});assert.equal(r.status,403);assert.equal(queries.length,0);pass('cross-origin export denied');
  r=await call('GET',base+'/summary',{},'marketing_editor');assert.equal(r.status,200);assert.equal(r.data.data.models.length,5);assert.equal(r.data.data.models[0].quantity,2);assert.equal(r.headers['Cache-Control'],'no-store, private');assert(!JSON.stringify(r.data).includes('qa@example.com'));pass('marketing summary: five models, no contact fields, no-store');
  for(const [method,p,b] of [['POST',base+'/search',{}],['POST',base+'/export',{}],['PATCH',base+'/1/status',{status:'contacted',revision:1,reason:'QA only'}],['GET',base+'/1/history',{}]]){r=await call(method,p,b,'marketing_editor');assert.equal(r.status,403);assert.equal(queries.length,1)}pass('marketing denied list/export/update/history server-side');
  r=await call('POST',base+'/search',{q:hostile,model:'m81-fresh-food-feeder',page:'2',limit:'25'},'customer_support');assert.equal(r.status,200);assert.equal(r.data.page,2);assert.equal(r.data.total,1);assert.equal(r.data.data[0].email,row.email);assert.equal(r.headers['Cache-Control'],'no-store, private');assert(queries.some(x=>x.values.includes(hostile)&&!x.sql.includes(hostile)&&x.values.includes(25)));pass('support filtered/paginated list with parameter binding');
  r=await call('POST',base+'/search',{limit:'51'},'operations_manager');assert.equal(r.status,400);assert.equal(queries.length,1);pass('page-size bound before data query');
  r=await call('POST',base+'/export',{},'customer_support');assert.equal(r.status,403);assert.equal(queries.length,1);pass('support cannot export PII');
  r=await call('GET',base+'/export-history',{},'operations_manager');assert.equal(r.status,403);pass('export audit accessible to super admin only');
  r=await call('GET',base+'/export-history',{},'super_admin');assert.equal(r.status,200);pass('super admin export audit view');
  r=await call('POST',base+'/export',{q:hostile,locale:'zh-TW'},'operations_manager');assert.equal(r.status,200);assert.equal(r.data.count,1);assert(r.data.csv.includes('"\'=1+2"'));const audit=queries.find(x=>x.sql.includes('INSERT INTO public.admin_audit_logs'));assert(audit);assert(!JSON.stringify(audit.values).includes(hostile));assert(!JSON.stringify(audit.values).includes(row.email));assert.equal(queries.at(-1).sql,'COMMIT');pass('operations CSV export, sanitized audit, committed before response');
  exportRows=Array.from({length:1001},()=>row);r=await call('POST',base+'/export',{},'operations_manager');assert.equal(r.status,422);assert(!queries.some(x=>x.sql.includes('INSERT INTO public.admin_audit_logs')));exportRows=[row];pass('export maximum 1000: refuse oversized result rather than truncate');
  current={status:'new',revision:1};r=await call('PATCH',base+'/1/status',{status:'contacted',revision:1,reason:'QA test'},'customer_support');assert.equal(r.status,200);assert.equal(r.data.data.revision,2);assert(queries.some(x=>x.sql.includes('FOR UPDATE')));assert(queries.some(x=>x.sql.includes('INSERT INTO public.admin_audit_logs')));assert.equal(queries.at(-1).sql,'COMMIT');pass('status update row lock, revision increment and same-transaction audit');
  current={status:'contacted',revision:2};r=await call('PATCH',base+'/1/status',{status:'confirmed',revision:1,reason:'QA test'},'operations_manager');assert.equal(r.status,409);assert(!queries.some(x=>x.sql.startsWith('UPDATE')));pass('stale revision rejected without writes');
  current={status:'cancelled',revision:2};r=await call('PATCH',base+'/1/status',{status:'new',revision:2,reason:'QA test'},'operations_manager');assert.equal(r.status,409);assert(!queries.some(x=>x.sql.startsWith('UPDATE')));pass('cancelled state cannot be reopened');
  current=null;r=await call('PATCH',base+'/1/status',{status:'contacted',revision:1,reason:'QA test'});assert.equal(r.status,404);pass('missing reservation rejected');
  r=await call('PATCH',base+'/1/status',{status:'contacted',revision:1,reason:'x'});assert.equal(r.status,400);assert.equal(queries.length,1);pass('status reason and revision validation');
  current={status:'new',revision:1};mode='audit_fail';r=await call('PATCH',base+'/1/status',{status:'contacted',revision:1,reason:'QA test'});assert.equal(r.status,503);assert.equal(queries.at(-1).sql,'ROLLBACK');assert(!queries.some(x=>x.sql==='COMMIT'));pass('status audit failure rolls back transaction (mock)');
  r=await call('POST',base+'/export',{},'operations_manager');assert.equal(r.status,503);assert.equal(queries.at(-1).sql,'ROLLBACK');assert(!('csv' in r.data));pass('export audit failure denies CSV and rolls back (mock)');mode='normal';
  r=await call('GET',base+'/1/history',{},'customer_support');assert.equal(r.status,200);assert(queries.some(x=>x.sql.includes('reservation_status')&&x.values[0]==='1'));pass('per-reservation audit history permission and parameter binding');
  const migration=fs.readFileSync(path.join(root,'migrations/20261128_reservation_operations.sql'),'utf8');assert(migration.includes('ADD COLUMN IF NOT EXISTS'));assert(migration.includes('BEGIN;')&&migration.includes('COMMIT;'));assert(!/\b(DROP|DELETE|TRUNCATE|GRANT)\b/i.test(migration));assert(rbacSource.indexOf('20261121_early_bird_reservations.sql')<rbacSource.indexOf('20261128_reservation_operations.sql'));pass('additive migration wiring and no destructive DDL');
  const app=fs.readFileSync(path.join(root,'src/App.tsx'),'utf8');assert(app.includes('<Route path="reservations" element={<AdminReservations />} />'));assert(app.includes('<Route index element={<AdminReservations />} />'));const nav=fs.readFileSync(path.join(root,'src/pages/admin/AdminLayout.tsx'),'utf8');assert(nav.includes('/admin/reservations'));const roles=fs.readFileSync(path.join(root,'src/config/adminPermissions.ts'),'utf8');assert(roles.includes("'/admin/reservations':'reservations.stats'"));pass('lazy route, index dashboard, sidebar and UI permissions wired');
  console.log(`V34_MOCK_TESTS_PASS ${passed} checks — no real PostgreSQL/browser/auth integration test`);
}
main().catch(e=>{console.error(e);process.exitCode=1});
