import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const MS_PER_DAY = 86_400_000;

const dDay = (expISO: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expISO);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((+exp - +today) / MS_PER_DAY);
};

const ExpiryBadge = ({ exp }: { exp: string }) => {
  const days = dDay(exp);
  const tone =
    days < 0
      ? "bg-red-600 text-white"
      : days <= 7
        ? "bg-amber-100 text-amber-800"
        : days <= 30
          ? "bg-yellow-100 text-yellow-800"
          : "bg-slate-100 text-slate-700";

  return (
    <span className={`shrink-0 inline-flex h-6 items-center px-2.5 rounded-full text-[12px] ${tone}`}>
      D-{days}
    </span>
  );
};

const QtyText = ({ value }: { value: number }) => {
  const color = value === 0 ? "text-slate-400" : "text-slate-900";
  return (
    <span className={`select-none tabular-nums tracking-tight text-[22px] font-black ${color}`}>
      {value}
    </span>
  );
};

type TempZone = "냉동" | "냉장" | "상온";
type Filter = TempZone | "전체";

interface Product {
  id: string;
  name: string;
  manufacturer: string;
  qty: number;
  unit: "개" | "봉" | "박스" | "팩";
  spec?: string;
  exp: string;
  zone: TempZone;
  thumbUrl?: string;
}

const products: Product[] = [
  {
    id: "p1",
    name: "비비고 왕교자 1.4kg",
    manufacturer: "CJ",
    qty: 12,
    unit: "봉",
    spec: "1.4kg",
    exp: "2026-02-14",
    zone: "냉동",
    thumbUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=640&auto=format&fit=crop",
  },
  {
    id: "p2",
    name: "서울우유 멸균 우유 1L",
    manufacturer: "서울우유",
    qty: 3,
    unit: "팩",
    spec: "1L",
    exp: "2025-12-20",
    zone: "상온",
  },
  {
    id: "p3",
    name: "풀무원 얇은피만두 455g",
    manufacturer: "풀무원",
    qty: 0,
    unit: "봉",
    spec: "455g",
    exp: "2025-11-19",
    zone: "냉동",
  },
];

const tabs: { label: string; value: Filter }[] = [
  { label: "전체", value: "전체" },
  { label: "냉동", value: "냉동" },
  { label: "냉장", value: "냉장" },
  { label: "상온", value: "상온" },
];

export default function ProductsList() {
  const [filter, setFilter] = useState<Filter>("전체");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesZone = filter === "전체" || product.zone === filter;
        if (!matchesZone) return false;
        if (!normalizedQuery) return true;
        const target = `${product.name} ${product.manufacturer}`.toLowerCase();
        return target.includes(normalizedQuery);
      }),
    [filter, normalizedQuery]
  );

  return (
    <div className="px-4 py-3 max-w-[480px] mx-auto pb-24">
      <div className="space-y-3">
        {/* 검색 */}
        <input
          type="text"
          placeholder="제품명/제조사 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full h-11 rounded-full bg-white border border-slate-200 px-4 text-[14px] outline-none"
        />

        {/* 탭 */}
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

        {/* 리스트 */}
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const meta = [product.manufacturer, product.unit, product.spec].filter(Boolean).join(" · ");
            return (
              <Link key={product.id} to={`/products/${product.id}`} className="block">
                <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl">
                  {/* 썸네일 */}
                  <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden">
                    {product.thumbUrl ? (
                      <img src={product.thumbUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100" aria-hidden />
                    )}
                  </div>

                  {/* 가운데 열 */}
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold text-slate-900 leading-tight line-clamp-2">{product.name}</p>

                    {/* 2행: 메타텍스트 옆에 D-배지를 밀착 배치 */}
                    <div className="mt-1 text-[13px] text-slate-600">
                      <span className="inline-flex w-full min-w-0 items-center gap-1">
                        <span className="min-w-0 truncate">{meta}</span>
                        <span className="shrink-0">
                          <ExpiryBadge exp={product.exp} />
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽 열: 수량 숫자만(가운데 정렬) */}
                  <div className="self-center shrink-0">
                    <QtyText value={product.qty} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      <Link
        to="/products/create"
        aria-label="제품 등록"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-slate-900 text-white grid place-items-center text-2xl shadow-lg"
      >
        +
      </Link>
    </div>
  );
}
