/* Offline static/runtime verification of the V3.2 data and asset contract. Not a browser or full build test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const sourceFiles = [];
function walk(dir) { for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const p = path.join(dir,e.name); if(e.isDirectory()) walk(p); else if(/(?<!\.d)\.tsx?$/.test(e.name)) sourceFiles.push(p); } }
walk(path.join(root,'src'));
for (const f of sourceFiles) {
  const src = ts.createSourceFile(f, fs.readFileSync(f,'utf8'), ts.ScriptTarget.Latest,true,f.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(src.parseDiagnostics.length,0,`${f}: ${src.parseDiagnostics.map(x=>ts.flattenDiagnosticMessageText(x.messageText,' ')).join('; ')}`);
}
console.log(`PASS source syntax ${sourceFiles.length} TypeScript files`);
const opts={target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS};
function load(file, dependencies={}, preview='true') {
  const code = read(file).replace(/import\.meta\.env/g,'__previewEnv');
  const transpiled = ts.transpileModule(code,{compilerOptions:opts,fileName:file,reportDiagnostics:true});
  assert.equal((transpiled.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,file);
  const mod={exports:{}};
  new Function('require','module','exports','__previewEnv',transpiled.outputText)(name=>{assert.ok(Object.hasOwn(dependencies,name),`Unexpected import ${name}`);return dependencies[name]},mod,mod.exports,{VITE_SHOW_PREVIEW_REVIEWS:preview});
  return mod.exports;
}
const products=load('src/i18n/products.ts');
const exploded=load('src/data/explodedViews.ts');
const locales=['zh-TW','en','th'];
const expected={M81:['250','5','4°C','25–28°C','300°','12V','10A','100–240V','120W','310 × 300 × 253'],M12:['4','2','3','265°','110°','12','5V','1A','AA','252 × 330 × 335'],M31:['3','2','A4','40','AA','5V','1A','182 × 300 × 262'],D61:['4','10','47','30 dB','5V','1A','2.5W','192 × 250 × 155'],D11BA:['2.5','2,500','3,000','45','220°','5°','304','Ag+']};
const pathOf = u => path.join(root,'public',u.replace(/^\//,''));
for (const [model, tokens] of Object.entries(expected)) for(const locale of locales) {
 const copy=products.productCopy[model][locale]; assert.ok(copy.name && copy.features.length>=3 && copy.specs.length>=5);
 const full=copy.specs.map(([k,v])=>`${k}: ${v}`).join(' '); for(const t of tokens) assert.ok(full.includes(t),`${model}/${locale} missing ${t}`);
}
for (const [slug,model] of Object.entries(products.modelBySlug)) {
 assert.equal(products.productBySku(slug,'zh-TW'),products.productCopy[model]['zh-TW']);
 assert.equal(products.productBySku(`WH-${model}-TW`,'en'),products.productCopy[model].en);
 const v=exploded.explodedViews[slug]; assert.equal(v.hotspots.length,6);
 const png=fs.readFileSync(pathOf(v.image)); assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),v.width); assert.equal(png.readUInt32BE(20),v.height);
 for(const h of v.hotspots) { assert.ok(h.x>0&&h.x<100&&h.y>0&&h.y<100); for(const locale of locales) assert.ok(h.title[locale]&&h.description[locale]); }
}
assert.equal(Object.keys(exploded.explodedViews).length,5);
assert.equal(products.productBySku('D11-BA','th'),products.productCopy.D11BA.th);
console.log('PASS 5 PNG files, exact dimensions, 30 hotspots, 90 localized hotspot pairs; 15 localized spec records and SKU aliases');
const rv=(live, flag)=>load('src/data/reviews.ts',{'@/config/storeConfig':{IS_LIVE_STORE:live},'@/i18n/products':products},flag);
const review=rv(false,'true'); assert.equal(review.REVIEWS.length,12); assert.equal(review.REVIEW_STATS.avgRating,4.83); assert.equal(review.REVIEW_STATS.fiveStarPercent,83);
assert.ok(review.REVIEWS.every(r=>!r.verified&&!r.badge&&!r.likes));
assert.equal(review.REVIEWS.flatMap(r=>r.photos||[]).length,6); assert.equal(review.previewAlbum().length,7);
const expectedCount={M81:3,M12:2,M31:2,D61:2,D11BA:3};
for(const [slug,model] of Object.entries(products.modelBySlug)) assert.equal(review.reviewsForProduct(slug).length,expectedCount[model]);
for(const asset of [...review.REVIEWS.flatMap(r=>r.photos||[]),...review.previewAlbum()]) assert.ok(fs.existsSync(pathOf(asset)),asset);
assert.equal(review.reviewsForProduct('dryer').length,0); assert.equal(rv(true,'true').REVIEWS.length,0); assert.equal(rv(false,'false').REVIEWS.length,0);
assert.equal(rv(true,'true').previewAlbum().length,0);
console.log('PASS 12 preview reviews, 4.83 average, 83% five-star, five product filters, 6 linked photos + 7 model photos, live/disabled gate');
const home=read('src/pages/Home.tsx'), detail=read('src/pages/ProductDetail.tsx'), app=read('src/App.tsx');
assert.ok(home.includes('<AuthenticReviewsSection />')); assert.ok(detail.includes('<AuthenticReviewsSection productSlug={product.slug} />')); assert.ok(detail.includes('copy.specs.map')); assert.ok(!detail.includes('aggregateRating:'));
assert.ok(app.includes('path="/checkout" element={IS_LIVE_STORE ?'));
const detailDirs={m81:5,m12:6,m31:5,d61:5,'d11-ba':6}; let count=0;
for(const [dir,n] of Object.entries(detailDirs)) for(let i=1;i<=n;i++){assert.ok(fs.existsSync(pathOf(`/images/products/detail/${dir}/${String(i).padStart(2,'0')}.webp`)));count++;}
console.log(`PASS entry wiring, reservation route guard, ${count} detail images`);
