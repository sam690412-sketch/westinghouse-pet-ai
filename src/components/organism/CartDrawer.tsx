import {useState} from 'react';
import {X,ShoppingCart,Trash2,Plus,Minus,PackageOpen} from 'lucide-react';
import {useCart} from '@/hooks/useCart';
import {env} from '@/lib/env';
import {useI18n} from '@/i18n';
import {storefront,tr} from '@/i18n/storefront';
import {IS_LIVE_STORE,CURRENCY_BY_LOCALE,APPROVED_REGIONAL_PRICES} from '@/config/storeConfig';
import {productBySku} from '@/i18n/products';
export interface CartDrawerProps {open:boolean;onClose:()=>void}
export function CartDrawer({open,onClose}:CartDrawerProps){
 const {items,cartCount,updateQuantity,removeItem,clearCart,isLoading,error}=useCart();
 const {locale,t}=useI18n();const [form,setForm]=useState(false);const [name,setName]=useState('');const [email,setEmail]=useState('');const [contact,setContact]=useState('');const [region,setRegion]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const currency=CURRENCY_BY_LOCALE[locale];
 const amounts=items.map(i=>APPROVED_REGIONAL_PRICES[i.sku]?.[currency]);
 const pricesReady=IS_LIVE_STORE && amounts.every(v=>typeof v==='number' && Number.isFinite(v));
 const total=pricesReady?items.reduce((s,i,j)=>s+(amounts[j]||0)*i.quantity,0):null;
 async function submit(e:React.FormEvent){e.preventDefault();if(busy||isLoading||IS_LIVE_STORE||items.length===0)return;setBusy(true);setMessage('');try{const response=await fetch(`${env.API_BASE}/early-bird-reservations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,contact,region,locale,items:items.map(i=>({sku:i.sku,quantity:i.quantity}))})});const result=await response.json();if(response.status===409&&result.code==='PRODUCT_UNAVAILABLE'){setMessage(({ 'zh-TW':'部分商品已下架，請移除該商品後重新送出。',en:'Some products are no longer available. Remove them and try again.',th:'สินค้าบางรายการไม่เปิดให้จองแล้ว กรุณานำออกและลองอีกครั้ง' })[locale]);return;}if(!response.ok||result.ok!==true)throw new Error('Request failed');setMessage(t('success'));clearCart();setForm(false)}catch{setMessage(t('failed'))}finally{setBusy(false)}}
 return <>{open&&<div className="fixed inset-0 z-[89] bg-black/50" onClick={onClose}/>}
 <aside role="dialog" aria-hidden={!open} aria-modal={open} inert={!open} aria-label={t('cart')} className={`fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col bg-white shadow-xl transition-transform ${open?'translate-x-0':'translate-x-full'}`}>
 <div className="flex items-center justify-between border-b p-5"><h2 className="flex items-center gap-2 font-bold"><ShoppingCart size={20}/>{t('cart')} ({cartCount})</h2><button onClick={onClose} aria-label={tr(locale,"關閉","Close","ปิด")}><X/></button></div>
 <div className="flex-1 overflow-y-auto p-5">{error&&<p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{items.length===0?<p>{t('empty')}</p>:items.map(item=>{const copy=productBySku(item.sku,locale)||productBySku(item.name.split(' ')[0],locale);return <div key={item.id} className="flex gap-3 border-b py-4">{item.imageUrl?<img src={item.imageUrl} alt={copy?.name||item.name} className="h-20 w-20 rounded bg-gray-100 object-contain"/>:<div className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-gray-100"><PackageOpen size={22}/></div>}<div className="flex-1"><div className="font-semibold">{copy?.name||item.name}</div><div className="text-sm text-gray-500">{IS_LIVE_STORE?(APPROVED_REGIONAL_PRICES[item.sku]?.[currency]===undefined?t('missingPrice'):`${currency} ${APPROVED_REGIONAL_PRICES[item.sku]?.[currency]}`):storefront.noPayment[locale]}</div><div className="mt-2 flex items-center gap-3"><button aria-label={tr(locale,"減少數量","Decrease","ลดจำนวน")} onClick={()=>updateQuantity(item.id,item.quantity-1)} disabled={busy||isLoading||item.quantity<=1}><Minus size={16}/></button><span>{item.quantity}</span><button aria-label={tr(locale,"增加數量","Increase","เพิ่มจำนวน")} onClick={()=>updateQuantity(item.id,item.quantity+1)} disabled={busy||isLoading||item.quantity>=Math.min(99,item.maxQuantity)}><Plus size={16}/></button><button className="ml-auto text-red-600" disabled={busy||isLoading} onClick={()=>removeItem(item.id)} aria-label={t('remove')}><Trash2 size={16}/></button></div></div></div>})}
 {items.length>0&&!IS_LIVE_STORE&&<div className="mt-4 rounded border bg-gray-50 p-3"><p className="text-sm font-medium">{t('accessories')}</p><p className="text-xs text-gray-600">{t('noAccessories')}</p></div>}
 {message&&<p role="status" className="mt-3 text-sm">{message}</p>}
 {form&&items.length>0&&!IS_LIVE_STORE&&<form id="early-bird-form" className="mt-4 space-y-3" onSubmit={submit}>
 <label className="block text-sm">{t('name')}<input className="mt-1 w-full rounded border p-2" required maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label>
 <label className="block text-sm">{t('email')}<input type="email" className="mt-1 w-full rounded border p-2" required maxLength={200} value={email} onChange={e=>setEmail(e.target.value)}/></label>
 <label className="block text-sm">{t('contactMethod')}<input className="mt-1 w-full rounded border p-2" required maxLength={200} value={contact} onChange={e=>setContact(e.target.value)}/></label>
 <label className="block text-sm">{t('region')}<input className="mt-1 w-full rounded border p-2" required maxLength={120} value={region} onChange={e=>setRegion(e.target.value)}/></label>
 <button disabled={busy||isLoading} type="submit" className="w-full rounded bg-orange-600 p-3 font-semibold text-white">{busy?t('loading'):t('submit')}</button></form>}
 </div>
 <div className="border-t p-5"><div className="mb-3 font-semibold">{IS_LIVE_STORE?(total===null?t('missingPrice'):`${t('total')}: ${new Intl.NumberFormat(locale,{style:'currency',currency}).format(total)}`):storefront.noPayment[locale]}</div>
 {items.length>0&&!form&&<button disabled={busy||isLoading || (IS_LIVE_STORE&&!pricesReady)} onClick={()=>{if(IS_LIVE_STORE){window.location.hash='#/checkout'}else setForm(true)}} className="w-full rounded bg-orange-600 p-3 font-semibold text-white disabled:opacity-50">{IS_LIVE_STORE?t('checkout'):t('submit')}</button>}
 <button className="mt-2 w-full p-2 text-sm" onClick={onClose}>{t('continue')}</button></div>
 </aside></>}

CartDrawer.displayName = "CartDrawer";
