import { useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useInventoryStore } from "@/store/inventory";
import { useSessionStore } from "@/store/session";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const ready = useInventoryStore((state) => state.ready);
  const bootstrap = useInventoryStore((state) => state.bootstrap);
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);

  useEffect(() => {
    if (!ready) {
      bootstrap();
    }
  }, [ready, bootstrap]);

  if (!user) {
    return null;
  }

  const links = [
    { to: "/products", label: "제품" },
    { to: "/products/create", label: "등록" },
  ];
  if (user.role === "admin") {
    links.push({ to: "/admin", label: "관리" });
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto flex h-14 w-full max-w-[640px] items-center justify-between px-4">
          <div>
            <p className="text-xs font-semibold text-slate-400">온누리 재고 관리 시스템</p>
            <p className="text-base font-bold text-slate-900 leading-tight">Onnuri IMS</p>
          </div>
          <div className="flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium ${
                  location.pathname.startsWith(link.to) ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-600">{user.name}</p>
              <p className="text-[11px] text-slate-400 uppercase">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {ready ? (
          <Outlet />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 text-sm">로딩 중…</div>
        )}
      </main>
    </div>
  );
}
