import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Package,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Ticket,
  Shield,
  Users,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PAGE_PERMISSION, hasAdminPermission, ROLE_LABELS, type AdminRole } from "@/config/adminPermissions";


const navItems = [
  { to: "/admin", label: "儀表板", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "商品上架與價格", icon: Package },
  { to: "/admin/orders", label: "訂單管理", icon: ShoppingCart },
  { to: "/admin/payments", label: "付款管理", icon: CreditCard },
  { to: "/admin/inventory", label: "庫存管理", icon: Package },
  { to: "/admin/tickets", label: "工單管理", icon: Ticket },
  { to: "/admin/warranties", label: "保固管理", icon: Shield },
  { to: "/admin/audit-log", label: "稽核記錄", icon: ClipboardList },
  { to: "/admin/approvals", label: "待審批中心", icon: CheckCheck },
  { to: "/admin/users", label: "人員權限", icon: Users },
  { to: "/admin/ai-knowledge", label: "AI 知識庫", icon: ClipboardList },
];

function AdminLogin({onLogin}:{onLogin:()=>void}){const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[error,setError]=useState('');return <form onSubmit={async e=>{e.preventDefault();try{const r=await fetch('/api/admin/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},body:JSON.stringify({email,password})});if(!r.ok)throw Error('登入失敗');onLogin()}catch(x){setError(String(x))}}} className="mx-auto max-w-sm mt-24 p-6 border rounded space-y-4"><h1 className="text-xl font-bold">管理員登入</h1><input aria-label="Email" type="email" required className="border p-2 w-full" value={email} onChange={e=>setEmail(e.target.value)}/><input aria-label="Password" type="password" required className="border p-2 w-full" value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<p role="alert">{error}</p>}<button type="submit">登入</button></form>}

export default function AdminLayout() {
  const [account,setAccount]=useState<{id:string;role:AdminRole;email:string}|null>(null);
  const [checked,setChecked]=useState(false);
  useEffect(()=>{fetch('/api/admin/me',{credentials:'same-origin'}).then(r=>r.ok?r.json():null).then(a=>setAccount(a)).finally(()=>setChecked(true))},[]);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Preview-only visual simulator. Never use this state as server authorization.
  const [demoRole,setDemoRole]=useState<AdminRole>("super_admin");
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Set page title
  useEffect(() => {
    const item = navItems.find(n =>
      n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to)
    );
    document.title = item ? `${item.label} — 管理後台 — Westinghouse Pet` : "管理後台 — Westinghouse Pet";
  }, [location.pathname]);

  const handleLogin=()=>{fetch('/api/admin/me',{credentials:'same-origin'}).then(r=>r.json()).then(setAccount)};
  const handleLogout=()=>{void fetch('/api/admin/logout',{method:'POST',credentials:'same-origin',headers:{'X-Requested-With':'XMLHttpRequest'}});setAccount(null);navigate('/')};
  if(!checked)return <p>驗證管理員身份中…</p>;
  if(!account)return <AdminLogin onLogin={handleLogin}/>;
  const effectiveRole=import.meta.env.DEV?demoRole:account.role;
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-semibold">管理後台</span>
          </div>
          <button className="md:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        <nav className="space-y-1 p-3">
          {navItems.filter(item=>hasAdminPermission(effectiveRole,ADMIN_PAGE_PERMISSION[item.to]||"dashboard.read")).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-neutral-100 hover:text-foreground"
          >
            <LogOut className="h-4.5 w-4.5" />
            登出
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Mobile header */}
        <div className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <button onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <span className="font-semibold">管理後台</span>
        </div>

        {import.meta.env.DEV&&<div className="border-b bg-amber-50 px-4 py-2 text-sm"><label htmlFor="demo-role" className="mr-2 font-semibold">角色切換模擬器（僅視覺預覽，非登入身份）</label><select id="demo-role" value={demoRole} onChange={e=>{setDemoRole(e.target.value as AdminRole);navigate("/admin")}} className="rounded border p-1">{Object.entries(ROLE_LABELS).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>}
        <main className="p-4 md:p-6">
          {hasAdminPermission(effectiveRole,ADMIN_PAGE_PERMISSION[location.pathname]||"dashboard.read") ? <Outlet context={{ role: account.role }} /> : <p role="alert">模擬角色沒有此頁面權限。伺服器仍須獨立驗證。</p>}
        </main>
      </div>
    </div>
  );
}
