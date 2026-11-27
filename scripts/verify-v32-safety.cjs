// Offline regression test of the actual patched reservation helper/route.
// No real database connections, accounts, payments or reservations.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const admin=fs.readFileSync(path.join(root,'admin-rbac.cjs'),'utf8');
const api=fs.readFileSync(path.join(root,'api-server.cjs'),'utf8');
const start=admin.indexOf('// V32_LISTED_RESERVATION_BEGIN');
const end=admin.indexOf('// V32_LISTED_RESERVATION_END');
assert.ok(start>=0 && end>start);
assert.ok(admin.includes('listed:isListedCatalogProduct({is_active,slug,archived})'));
const source=admin.slice(start,end);
const catalog='MOCK_CATALOG_SELECT';
const m81={sku:'M81',slug:'m81-fresh-food-feeder',is_active:true,archived:false};
const d11={sku:'D11-BA',slug:'d11ba-water-dispenser',is_active:true,archived:false};
const body={name:'QA only',email:'qa@example.invalid',contact:'QA only',region:'TW',locale:'zh-TW',items:[{sku:m81.slug,quantity:1},{sku:d11.slug,quantity:2}]};
let calls=[];let rows=[];let fail=false;let rowCount=1;
const tx=async fn=>fn({query:async(sql,params)=>{
  calls.push({sql,params});
  if(sql===catalog+' ORDER BY pp.sku') {if(fail) throw Object.assign(new Error('mock catalog unavailable'),{code:'MOCK'});return {rows};}
  if(sql.startsWith('INSERT INTO public.early_bird_reservations'))return {rowCount};
  if(sql.startsWith('SET LOCAL ')||sql.startsWith('LOCK TABLE '))return {};
  throw Error('Unexpected SQL: '+sql);
}});
const mod={exports:{}};
new Function('tx','catalogSelect','module',source)(tx,catalog,mod);
const a=api.indexOf('  "/api/early-bird-reservations": async');
const b=api.indexOf('\n  // Cart',a);
assert.ok(a>=0&&b>a);
const routeSource=api.slice(a,b);
function route(live='false',db='mock-not-a-real-uri'){
  return new Function('rbac','DATABASE_URI','process','return ({'+routeSource+'})["/api/early-bird-reservations"]')(mod.exports,db,{env:{IS_LIVE_STORE:live}});
}
const writes=()=>calls.filter(c=>c.sql.startsWith('INSERT INTO '));
async function test(label,fn){calls=[];rows=[m81,d11];fail=false;rowCount=1;await fn();console.log('PASS '+label);}
(async()=>{
  await test('two listed models including D11-BA: one parameterized insert',async()=>{
    const result=await route()(null,body);assert.equal(result.ok,true);assert.equal(writes().length,1);
    assert.equal(calls[1].sql.includes('IN SHARE MODE'),true);assert.equal(calls[2].sql,catalog+' ORDER BY pp.sku');
    assert.deepEqual(JSON.parse(writes()[0].params[5]),body.items);
  });
  for(const [label,catalogRows] of [
    ['delisted', [m81,{...d11,is_active:false}]],
    ['archived',[m81,{...d11,archived:true}]],
    ['missing',[m81]],
    ['slug mismatch',[m81,{...d11,slug:m81.slug}]],
    ['empty catalog',[]],
  ]) await test(label+': 409, zero writes',async()=>{rows=catalogRows;const result=await route()(null,body);assert.equal(result.status,409);assert.equal(result.code,'PRODUCT_UNAVAILABLE');assert.equal(writes().length,0);});
  await test('duplicate SKU: 400 before DB',async()=>{const r=await route()(null,{...body,items:[body.items[0],body.items[0]]});assert.equal(r.status,400);assert.equal(calls.length,0);});
  await test('unknown SKU and invalid quantity: zero queries',async()=>{for(const items of [[{sku:'dryer',quantity:1}],[{sku:m81.slug,quantity:100}]]) {const r=await route()(null,{...body,items});assert.ok(r.error);}assert.equal(calls.length,0);});
  await test('catalog query error: 503, zero writes',async()=>{fail=true;const result=await route()(null,body);assert.equal(result.status,503);assert.equal(writes().length,0);});
  await test('unconfirmed insert: never report success',async()=>{rowCount=0;assert.equal((await route()(null,body)).status,503);});
  await test('live store cannot submit prelaunch reservation',async()=>{assert.equal((await route('true')(null,body)).status,403);assert.equal(calls.length,0);});
  await test('payment gate still present',async()=>{assert.ok(api.includes("process.env.IS_LIVE_STORE !== 'true'"));for(const p of ['/api/orders/create','/api/payments/create','/api/payments/mock'])assert.ok(api.includes(p));});
  console.log('SAFETY_MOCK_TESTS_PASS (not a real database or HTTP integration test)');
})().catch(e=>{console.error(e);process.exitCode=1});
