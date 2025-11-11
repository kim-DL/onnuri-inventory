import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ExpiryBadge from "@/components/Expiry/ExpiryBadge";
import QtyText from "@/components/Qty/QtyText";
import { dDay } from "@/lib/date";
import { useInventoryStore } from "@/store/inventory";
import type { TempZone } from "@/types/domain";

type Filter = "전체" | TempZone;

const tabs: { label: string; value: Filter }[] = [
  { label: "전체", value: "전체" },
  { label: "냉동", value: "냉동" },
  { label: "냉장", value: "냉장" },
  { label: "상온", value: "상온" },
];

export default function ProductsList() {
  const products = useInventoryStore((state) => state.products);
  const exportCsv = useInventoryStore((state) => state.exportCsv);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("전체");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesZone = filter === "전체" || product.zone === filter;
      if (!matchesZone) return false;
      if (!q) return true;
      const haystack = `${product.name} ${product.manufacturer ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query, filter]);

  const stats = useMemo(() => {
    const total = products.length;
    const alerts = products.filter((p) => dDay(p.exp) <= 7).length;
    return { total, alerts };
  }, [products]);

  return (
    <div className="px-4 py-3 max-w-[480px] mx-auto pb-24 space-y-4">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400">전체 {stats.total}건</p>
            <h1 className="text-2xl font-bold text-slate-900">제품 재고</h1>
          </div>
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            className="text-[13px] font-semibold text-slate-600 underline underline-offset-4"
          >
            CSV 내보내기
          </button>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">유통 임박</span>
          <span className="text-emerald-600 font-semibold">{stats.alerts}건</span>
        </div>
      </header>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="제품명/제조사 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1 h-11 rounded-full bg-white border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const selected = filter === tab.value;
          const tabClass = selected
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-700 border-slate-200";
          return (
            <button
              key={tab.value}
              type="button"
              className={`border rounded-full px-3 py-1 text-[13px] font-medium ${tabClass}`}
              onClick={() => setFilter(tab.value)}
              aria-pressed={selected}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="py-5 text-center text-[13px] text-slate-500">조건에 맞는 제품이 없습니다.</p>
        )}
        {filtered.map((product) => {
          const meta = [product.manufacturer, product.unit, product.spec].filter(Boolean).join(" · ");

          return (
            <Link key={product.id} to={`/products/${product.id}`} className="block">
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl focus:outline focus:outline-2 focus:outline-slate-300">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden">
                  {product.thumb ? (
                    <img src={product.thumb} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-[12px] text-slate-400">No Img</div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[16px] font-semibold text-slate-900 leading-tight line-clamp-2">
                    {product.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-600">
                    <span className="flex-1 min-w-0 truncate">{meta || "-"}</span>
                    <ExpiryBadge exp={product.exp} />
                  </div>
                </div>

                <div className="self-center shrink-0">
                  <QtyText value={product.qty} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        to="/products/create"
        aria-label="제품 등록"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-slate-900 text-white grid place-items-center text-2xl shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
      >
        +
      </Link>
    </div>
  );
}
