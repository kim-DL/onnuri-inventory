import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ExpiryBadge from "@/components/Expiry/ExpiryBadge";
import QtyText from "@/components/Qty/QtyText";
import { formatYMD } from "@/lib/date";
import { useInventoryStore } from "@/store/inventory";

export default function ProductDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const products = useInventoryStore((state) => state.products);
  const txns = useInventoryStore((state) => state.txns);

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const recent = useMemo(
    () => txns.filter((txn) => txn.productId === id).slice(0, 5),
    [txns, id],
  );

  if (!product) {
    return (
      <div className="px-4 py-3 max-w-[480px] mx-auto">
        <p className="text-sm text-slate-600">
          제품을 찾을 수 없습니다.{" "}
          <Link to="/products" className="text-slate-900 underline">
            목록으로 이동
          </Link>
        </p>
      </div>
    );
  }

  const infoRows = [
    { label: "보관 구분", value: product.zone },
    { label: "제조사", value: product.manufacturer ?? "-" },
    { label: "단위", value: product.unit },
    { label: "규격/중량", value: product.spec ?? "-" },
  ];

  return (
    <div className="px-4 py-3 max-w-[480px] mx-auto pb-28 space-y-3">
      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden">
          {product.thumb ? (
            <img src={product.thumb} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-[12px] text-slate-400">No Img</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-semibold text-slate-900 leading-tight line-clamp-2">{product.name}</p>
        </div>
        <div className="self-center shrink-0">
          <QtyText value={product.qty} />
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200">
        <div className="text-[12px] font-medium text-slate-500 mb-2">기본 정보</div>
        {infoRows.map((row, idx) => (
          <div
            key={row.label}
            className={`flex items-center justify-between py-2 border-b border-slate-100 first:pt-0 ${
              idx === infoRows.length - 1 ? "last:pb-0 last:border-b-0" : ""
            }`}
          >
            <span className="text-[13px] text-slate-500">{row.label}</span>
            <span className="text-[14px] text-slate-800 font-medium">{row.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-2">
          <span className="text-[13px] text-slate-500">유통기한</span>
          <div className="flex items-center gap-2 text-[14px] text-slate-800">
            <span>{formatYMD(product.exp)}</span>
            <ExpiryBadge exp={product.exp} />
          </div>
        </div>
      </div>

      <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
        <div className="text-[14px] font-semibold text-slate-900">최근 기록</div>
        {recent.length === 0 && <p className="text-sm text-slate-500">등록된 입/출고 내역이 없습니다.</p>}
        <div className="space-y-1">
          {recent.map((txn) => (
            <div
              key={txn.id}
              className="grid grid-cols-[auto_1fr_auto] gap-x-2 py-1 border-b border-slate-100 last:border-b-0"
            >
              <span className="text-[12px] text-slate-500">{formatYMD(txn.createdAt.slice(0, 10))}</span>
              <div className="text-[13px] text-slate-800">
                <p className="font-medium">
                  {txn.type === "in" ? "입고" : txn.type === "out" ? "출고" : "조정"}
                </p>
                {txn.memo && <p className="text-[12px] text-slate-500">{txn.memo}</p>}
              </div>
              <span
                className={`text-[14px] font-semibold tabular-nums ${
                  txn.diff >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {txn.diff > 0 ? `+${txn.diff}` : txn.diff}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-24" aria-hidden />

      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3">
        <div className="mx-auto grid max-w-[480px] grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => navigate(`/inbound?product=${product.id}`)}
            className="h-11 rounded-full border border-slate-300 text-slate-800 text-sm font-semibold"
          >
            입고
          </button>
          <button
            type="button"
            onClick={() => navigate(`/outbound?product=${product.id}`)}
            className="h-11 rounded-full border border-slate-300 text-slate-800 text-sm font-semibold"
          >
            출고
          </button>
          <button
            type="button"
            onClick={() => navigate(`/adjust?product=${product.id}`)}
            className="h-11 rounded-full border border-slate-300 text-slate-800 text-sm font-semibold"
          >
            조정
          </button>
        </div>
      </div>
    </div>
  );
}
