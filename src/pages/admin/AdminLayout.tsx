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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading } from "@/components/atomic/Typography";

const ADMIN_SECRET_KEY = "admin_secret";

const navItems = [
  { to: "/admin", label: "儀表板", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "訂單管理", icon: ShoppingCart },
  { to: "/admin/payments", label: "付款管理", icon: CreditCard },
  { to: "/admin/inventory", label: "庫存管理", icon: Package },
  { to: "/admin/tickets", label: "工單管理", icon: Ticket },
  { to: "/admin/warranties", label: "保固管理", icon: Shield },
  { to: "/admin/audit-log", label: "稽核記錄", icon: ClipboardList },
];

function AdminLogin({ onLogin }: { onLogin: (secret: string) => void }) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) { setError("請輸入管理密鑰"); return; }
    onLogin(secret.trim());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <Heading as="h1" variant="h3">管理後台</Heading>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">管理密鑰</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => { setSecret(e.target.value); setError(""); }}
              placeholder="輸入 ADMIN_SECRET"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {error && <p className="mt-1 text-xs text-error">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            登入
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [secret, setSecret] = useState<string | null>(() =>
    localStorage.getItem(ADMIN_SECRET_KEY)
  );
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const handleLogin = (s: string) => {
    localStorage.setItem(ADMIN_SECRET_KEY, s);
    setSecret(s);
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SECRET_KEY);
    setSecret(null);
    navigate("/");
  };

  if (!secret) return <AdminLogin onLogin={handleLogin} />;

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
          {navItems.map((item) => (
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
      <div className="flex-1">
        {/* Mobile header */}
        <div className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <button onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <span className="font-semibold">管理後台</span>
        </div>

        <main className="p-4 md:p-6">
          <Outlet context={{ secret }} />
        </main>
      </div>
    </div>
  );
}
