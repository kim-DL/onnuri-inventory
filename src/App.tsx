import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-[100dvh] bg-surface-50">
      {/* 상단 앱바 (임시 내비게이션) */}
      <header className="h-12 flex items-center gap-3 px-4 bg-white border-b border-line-200">
        <Link to="/products" className="text-sm font-semibold text-ink-900">제품</Link>
        <Link to="/admin" className="text-sm text-ink-500">관리자</Link>
      </header>

      {/* 각 페이지가 표시될 영역 */}
      <Outlet />
    </div>
  );
}
