/* V3.3 targeted static/data regression. Browser and deployed API QA remain separate. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const src=read('src/i18n/storefront.ts');
const output=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.equal(output.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const m={exports:{}};new Function('module','exports',output.outputText)(m,m.exports);
const {isBackendHealthy,storefront,tr}=m.exports;
assert.equal(isBackendHealthy(200,{status:'ok',db:'connected'}),true);
for(const [status,value] of [[500,{status:'ok',db:'connected'}],[429,{status:'ok',db:'connected'}],[200,{status:'ok',db:'error'}],[200,{status:'ok'}],[200,'<html>'],[200,null],[200,{}]])assert.equal(isBackendHealthy(status,value),false);
for(const l of ['zh-TW','en','th'])for(const v of Object.values(storefront))assert.ok(v[l]?.trim());
assert.equal(tr('th','a','b','c'),'c');
console.log('PASS backend health predicate: healthy, HTTP errors, DB failure, missing fields, invalid payload; 3 locale dictionary');
const hero=read('src/sections/HeroSection.tsx');
for(let n=1;n<=3;n++){const url=`/images/hero/hero-0${n}.webp`;assert.ok(hero.includes(url));const data=fs.readFileSync(path.join(root,'public',url));assert.equal(data.subarray(0,4).toString(),'RIFF');assert.equal(data.subarray(8,12).toString(),'WEBP');}
assert.ok(hero.includes('object-contain'));assert.ok(!hero.includes('object-cover'));
const banner=read('src/components/DegradedBanner.tsx');assert.ok(banner.includes('isBackendHealthy(response.status, await response.json())'));assert.ok(banner.includes("method: 'GET'"));assert.ok(!banner.includes('supabaseConfigured'));
const productHero=read('src/sections/ProductHeroSection.tsx'),detail=read('src/pages/ProductDetail.tsx'),social=read('src/sections/SocialProofBar.tsx');
for(const text of [productHero,detail,social])for(const bad of ['128 則評價','今天下單','人正在瀏覽','剛購買了'])assert.ok(!text.includes(bad),bad);
assert.ok(productHero.includes('IS_LIVE_STORE'));assert.ok(productHero.includes('wpet:open-cart'));assert.ok(detail.includes('IS_LIVE_STORE?{offers:'));assert.ok(read('src/components/atomic/StorefrontPrice.tsx').includes('approved?.listed!==true'));
assert.ok(read('src/context/ProductPricingContext.tsx').includes('?.listed===true'));assert.ok(read('src/components/organism/Header.tsx').includes('aria-label="Language"'));
assert.ok(read('src/App.tsx').includes('lazy(() => import("./pages/ProductDetail"))'));
console.log('PASS dedicated Hero assets, launch copy, approved listing/reference price, backend health wiring, language control and route splitting source checks');
