import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {PRODUCTS,type ProductData} from '@/data/products';
import {env} from '@/lib/env';
type CatalogStatus='loading'|'ready'|'error';
type Prices={sku:string;msrp_twd:number;retail_twd:number;promo_twd:number;listed?:boolean};
const MAP:Record<string,string>={'m81-fresh-food-feeder':'M81','m12-panoramic-feeder':'M12','m31-gashapon-feeder':'M31','d61-stainless-dispenser':'D61','d11ba-water-dispenser':'D11-BA'};
const Context=createContext<{prices:Record<string,Prices>;catalogStatus:CatalogStatus;products:ProductData[];priceFor:(slugOrSku:string,fallbackCents:number)=>number;originalFor:(slugOrSku:string,fallbackCents:number)=>number;refresh:()=>Promise<void>}>({prices:{},catalogStatus:'loading',products:[],priceFor:(_,v)=>v,originalFor:(_,v)=>v,refresh:async()=>{}});
export function ProductPricingProvider({children}:{children:React.ReactNode}){
 const [prices,setPrices]=useState<Record<string,Prices>>({});
 const [catalogStatus,setCatalogStatus]=useState<CatalogStatus>('loading');
 const refresh=async()=>{setCatalogStatus('loading');try{const r=await fetch(`${env.API_BASE}/products/prices`,{cache:'no-store'});if(!r.ok)throw Error('Pricing unavailable');const j=await r.json();if(!Array.isArray(j.data))throw Error('Invalid catalog');const next:Record<string,Prices>={};for(const row of j.data||[]){if(row&&typeof row.sku==='string'&&[row.msrp_twd,row.retail_twd,row.promo_twd].every(v=>Number.isSafeInteger(v)&&v>0)&&row.msrp_twd>=row.retail_twd&&row.retail_twd>=row.promo_twd&&typeof row.listed==='boolean')next[row.sku.toUpperCase()]=row;else throw Error('Invalid price record');}setPrices(next);setCatalogStatus('ready')}catch{setPrices({});setCatalogStatus('error')}};
 useEffect(()=>{void refresh()},[]);
 const skuOf=(s:string)=>MAP[s]||s.replace(/^WH-/,'').replace(/-TW$/,'').toUpperCase().replace(/^D11BA$/,'D11-BA');
 const priceFor=(s:string,fallback:number)=>prices[skuOf(s)]?.promo_twd*100||fallback;
 const originalFor=(s:string,fallback:number)=>prices[skuOf(s)]?.msrp_twd*100||fallback;
 const products=useMemo(()=>PRODUCTS.filter(p=>prices[skuOf(p.slug)]?.listed===true).map(p=>({...p,price:priceFor(p.slug,p.price),originalPrice:originalFor(p.slug,p.originalPrice||p.price)})),[prices]);
 return <Context.Provider value={{prices,catalogStatus,products,priceFor,originalFor,refresh}}>{children}</Context.Provider>;
}
export const useProductPricing=()=>useContext(Context);
