import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, ShoppingCart, Search, ChevronDown, Smartphone, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCart } from '@/hooks/useCart';
import { useProductPricing } from '@/context/ProductPricingContext';
import { useI18n } from '@/i18n';
import { productBySku } from '@/i18n/products';
import { storefront, tr } from '@/i18n/storefront';
import type { Locale } from '@/i18n/types';

// Keep exported contracts for existing consumers; all public links use live listing data.
export interface NavGrandChild { label: string; href: string; tag?: string; }
export interface NavChild { label: string; href: string; description?: string; featured?: boolean; children?: NavGrandChild[]; }
export interface NavItem { label: string; href: string; children?: NavChild[]; }
export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logoText?: string; wishlistCount?: number; isAuthenticated?: boolean; userName?: string;
  onSearch?: (query: string) => void; onCartClick?: () => void; onWishlistClick?: () => void;
  onLoginClick?: () => void; onAccountClick?: () => void; onMobileMenuToggle?: (open: boolean) => void;
}
interface InstallPromptEvent extends Event { prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>; }

function InstallAppButton() {
  const {locale}=useI18n();
  const installPrompt=useRef<InstallPromptEvent|null>(null);
  const [instructionsOpen,setInstructionsOpen]=useState(false);
  const [installed,setInstalled]=useState(()=>!!(navigator as Navigator & { standalone?: boolean }).standalone || window.matchMedia('(display-mode: standalone)').matches);
  useEffect(()=>{
    const save=(e:Event)=>{e.preventDefault();installPrompt.current=e as InstallPromptEvent;};
    const mark=()=>{installPrompt.current=null;setInstalled(true);setInstructionsOpen(false);};
    window.addEventListener('beforeinstallprompt',save);window.addEventListener('appinstalled',mark);
    if(import.meta.env.PROD&&'serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js').catch(()=>{});
    return ()=>{window.removeEventListener('beforeinstallprompt',save);window.removeEventListener('appinstalled',mark);};
  },[]);
  async function install(e:React.MouseEvent<HTMLButtonElement>){const prompt=installPrompt.current;if(!prompt)return;e.preventDefault();installPrompt.current=null;try{await prompt.prompt();}catch{setInstructionsOpen(true);}}
  if(installed)return null;
  const label=tr(locale,'安裝 App','Install app','ติดตั้งแอป');
  return <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
    <DialogTrigger asChild><Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 whitespace-nowrap text-xs" onClick={e=>void install(e)}><Smartphone size={15}/>{label}</Button></DialogTrigger>
    <DialogContent className="z-[80] max-w-[calc(100vw-2rem)] sm:max-w-lg">
      <DialogTitle>{label}</DialogTitle>
      <DialogDescription>{tr(locale,'將西屋寵物加入主畫面，下次可直接開啟。','Add Westinghouse Pet to your home screen for quick access.','เพิ่ม Westinghouse Pet ลงในหน้าจอหลักเพื่อเปิดใช้งานได้รวดเร็ว')}</DialogDescription>
      <ul className="space-y-3 text-sm"><li><strong>iPhone / iPad Safari</strong><p>{tr(locale,'分享 → 加入主畫面 → 加入。','Share → Add to Home Screen → Add.','แชร์ → เพิ่มไปยังหน้าจอโฮม → เพิ่ม')}</p></li><li><strong>Android Chrome</strong><p>{tr(locale,'瀏覽器選單 → 安裝應用程式／加到主畫面。','Browser menu → Install app / Add to Home screen.','เมนูเบราว์เซอร์ → ติดตั้งแอป / เพิ่มลงในหน้าจอหลัก')}</p></li><li><strong>Chrome / Edge</strong><p>{tr(locale,'使用網址列或瀏覽器選單的安裝選項。','Use the install option in the address bar or browser menu.','ใช้ตัวเลือกติดตั้งในแถบที่อยู่หรือเมนูเบราว์เซอร์')}</p></li></ul>
    </DialogContent>
  </Dialog>;
}

export function Header({logoText='Westinghouse Pet',wishlistCount=0,isAuthenticated=false,userName,onSearch,onCartClick,onWishlistClick,onLoginClick,onAccountClick,onMobileMenuToggle,className,...props}: HeaderProps) {
  const {locale,setLocale,t}=useI18n();
  const {cartCount}=useCart();
  const {products}=useProductPricing();
  const navigate=useNavigate();
  const location=useLocation();
  const [mobileOpen,setMobileOpen]=useState(false);
  const [search,setSearch]=useState('');
  const [searchOpen,setSearchOpen]=useState(false);
  const [desktopProducts,setDesktopProducts]=useState(false);
  const navRef=useRef<HTMLElement|null>(null);
  useEffect(()=>{setMobileOpen(false);setDesktopProducts(false);setSearchOpen(false);},[location.pathname,location.search]);
  useEffect(()=>{const outside=(e:PointerEvent)=>{if(e.target instanceof Node&&!navRef.current?.contains(e.target)){setDesktopProducts(false);setMobileOpen(false);setSearchOpen(false);}};const esc=(e:KeyboardEvent)=>{if(e.key==='Escape'){setDesktopProducts(false);setMobileOpen(false);setSearchOpen(false);}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',esc);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',esc);};},[]);
  const toggle=(open:boolean)=>{setMobileOpen(open);onMobileMenuToggle?.(open);};
  const close=()=>{toggle(false);setDesktopProducts(false);setSearchOpen(false);};
  const topLinks=[{label:t('guides'),href:'/solutions'},{label:t('brand'),href:'/brand'},{label:t('reviews'),href:'/reviews'},{label:t('faq'),href:'/faq'},{label:t('contact'),href:'/contact'}];
  const categories=[{label:t('feeders'),href:'/products/feeders',kind:'feeder'},{label:t('fountains'),href:'/products/water-dispensers',kind:'water'}];
  const submit=(e:React.FormEvent)=>{e.preventDefault();const q=search.trim();if(!q)return; if(onSearch)onSearch(q);else navigate('/products?q='+encodeURIComponent(q));close();};
  const productLinks=(mobile:boolean)=><><Link to="/products" onClick={close} className="block rounded-lg px-3 py-2.5 font-semibold hover:bg-muted">{t('products')}</Link>{categories.map(cat=><div key={cat.href} className="rounded-xl bg-neutral-50 p-2"><Link to={cat.href} onClick={close} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white">{cat.label}</Link>{products.filter(p=>p.category===cat.kind).map(p=><Link key={p.slug} to={`/products/${p.slug}`} onClick={close} className="block rounded px-3 py-2 text-sm text-muted-foreground hover:bg-white hover:text-primary">{productBySku(p.slug,locale)?.name??p.name}</Link>)}</div>)}<Link to="/products/accessories" onClick={close} className={cn('block rounded-lg px-3 py-2.5 text-sm hover:bg-muted',!mobile&&'col-span-full')}>{tr(locale,'耗材配件','Accessories','อุปกรณ์เสริม')}</Link></>;
  return <header ref={navRef} className={cn('sticky top-0 z-[60] border-b border-border bg-white/95 shadow-sm backdrop-blur-md',className)} {...props}>
    <div className="mx-auto max-w-container-lg px-3 sm:px-6 lg:px-8">
      <div className="flex min-h-[64px] items-center justify-between gap-2 py-2">
        <Link to="/" onClick={close} aria-label="Westinghouse Pet" className="min-w-0 flex-1 text-left leading-none text-[#10253c]">
          <span className="block text-[clamp(14px,4.5vw,18px)] font-bold tracking-[-.045em] sm:text-2xl">{logoText.replace(/ Pet$/,'')}</span>
          <span className="mt-1 block text-[10px] font-semibold tracking-[.18em] text-muted-foreground sm:text-xs">PET TAIWAN{locale==='zh-TW'?' · 西屋寵物家電':''}</span>
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
          <select aria-label="Language" value={locale} onChange={e=>setLocale(e.target.value as Locale)} className="h-9 max-w-[86px] rounded-md border border-border bg-white px-1 text-xs sm:max-w-none sm:px-2"><option value="zh-TW">繁中</option><option value="en">EN</option><option value="th">ไทย</option></select>

          <Button type="button" variant="ghost" size="icon" className="hidden h-9 w-9 shrink-0 md:flex" aria-label={tr(locale,'搜尋商品','Search products','ค้นหาสินค้า')} aria-expanded={searchOpen} onClick={()=>setSearchOpen(v=>!v)}><Search size={19}/></Button>
          {onWishlistClick&&<Button type="button" variant="ghost" size="icon" className="relative hidden md:flex" onClick={onWishlistClick} aria-label={tr(locale,'收藏清單','Wishlist','รายการโปรด')}><Heart size={18}/>{wishlistCount>0&&<span className="absolute right-0 top-0 text-xs">{wishlistCount}</span>}</Button>}
          {(isAuthenticated?onAccountClick:onLoginClick)&&<Button type="button" variant="ghost" className="hidden md:flex" onClick={isAuthenticated?onAccountClick:onLoginClick}><User size={16}/>{isAuthenticated?userName:tr(locale,'登入','Sign in','เข้าสู่ระบบ')}</Button>}
          <Button type="button" variant="ghost" size="icon" className="relative h-9 w-9 shrink-0" onClick={onCartClick??(()=>window.dispatchEvent(new Event('wpet:open-cart')))} aria-label={t('cart')}><ShoppingCart size={20}/>{cartCount>0&&<span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold text-white">{cartCount}</span>}</Button>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 lg:hidden" aria-label={tr(locale,'選單','Menu','เมนู')} aria-expanded={mobileOpen} aria-controls="wpet-mobile-nav" onClick={()=>toggle(!mobileOpen)}>{mobileOpen?<X size={21}/>:<Menu size={21}/>}</Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border/50 py-1.5 text-xs"><span className="min-w-0 text-muted-foreground">{storefront.launch[locale]}</span><div className="shrink-0"><InstallAppButton/></div></div>
      <nav aria-label={tr(locale,'主導覽','Main navigation','เมนูหลัก')} className="hidden items-center justify-between gap-3 border-t border-border/50 py-2 lg:flex">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium">
          <div className="relative"><button type="button" aria-expanded={desktopProducts} className="flex items-center gap-1 rounded-lg px-2 py-2 hover:bg-muted" onClick={()=>setDesktopProducts(v=>!v)}>{t('products')}<ChevronDown size={15}/></button>{desktopProducts&&<div className="absolute left-0 top-full grid w-[min(650px,90vw)] grid-cols-2 gap-3 rounded-2xl border bg-white p-4 shadow-xl">{productLinks(false)}</div>}</div>
          {topLinks.map(item=><Link key={item.href} to={item.href} onClick={close} className="rounded-md px-1 py-2 hover:text-primary" aria-current={location.pathname===item.href?'page':undefined}>{item.label}</Link>)}
        </div>
      </nav>
      {searchOpen&&<form onSubmit={submit} className="flex items-center gap-2 border-t py-3"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tr(locale,'輸入機型或名稱','Search model or name','ค้นหารุ่นหรือชื่อสินค้า')} className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"/><Button type="submit"><Search size={16}/></Button></form>}
    </div>
    {mobileOpen&&<nav id="wpet-mobile-nav" className="absolute inset-x-0 top-full max-h-[65vh] overflow-y-auto border-b bg-white p-4 shadow-xl lg:hidden" aria-label={tr(locale,'手機導覽','Mobile navigation','เมนูมือถือ')}>
      <form onSubmit={submit} className="mb-3 flex gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tr(locale,'搜尋機型','Search models','ค้นหารุ่น')} className="min-w-0 flex-1 rounded-md border px-3 text-sm"/><Button type="submit"><Search size={16}/></Button></form>
      <div className="space-y-2">{productLinks(true)}{topLinks.map(item=><Link key={item.href} to={item.href} onClick={close} className="block rounded-lg border px-3 py-3 text-sm font-medium hover:bg-muted">{item.label}</Link>)}</div>
    </nav>}
  </header>;
}
Header.displayName='Header';
