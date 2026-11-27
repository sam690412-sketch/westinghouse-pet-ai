const models: Record<string, [string,string]> = {
 'm81-fresh-food-feeder':['m81','m81'], 'm12-panoramic-feeder':['m12','m12'], 'm31-gashapon-feeder':['m31','m31'], 'd61-stainless-dispenser':['d61','d61'], 'd11ba-water-dispenser':['d11-ba','d11ba'],
};
export function galleryFor(slug:string,name:string,hero?:string|null) {
 const model=models[slug];
 if(!model) return [{url:hero || '/images/placeholder-product.jpg',alt:name}];
 const [file,scene]=model;
 return [`/images/products/${file}-main.webp`,`/images/products/${scene}-lifestyle.jpg`,`/images/products/${file}-01.webp`].map(url=>({url,alt:name}));
}
