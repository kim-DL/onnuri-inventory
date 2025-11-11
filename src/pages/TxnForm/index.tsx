import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInventoryStore } from "@/store/inventory";

type Mode = "in" | "out" | "adj";

const TITLES: Record<Mode, string> = {
  in: "입고 등록",
  out: "출고 등록",
  adj: "수량 조정",
};

export default function TxnForm({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const productId = params.get("product") ?? "";
  const product = useInventoryStore((state) => state.getProduct(productId));
  const recordTxn = useInventoryStore((state) => state.recordTxn);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string>();
  const title = TITLES[mode];

  const helpText = useMemo(() => {
    if (!product) return "";
    switch (mode) {
      case "in":
        return `현재 수량 ${product.qty} → 입고 수량을 입력하세요.`;
      case "out":
        return `현재 수량 ${product.qty} → 출고 후 수량이 0 이상이어야 합니다.`;
      case "adj":
        return `현재 수량 ${product.qty} → 목표 수량을 입력하세요.`;
      default:
        return "";
    }
  }, [product, mode]);

  if (!product) {
    return (
      <div className="px-4 py-3 max-w-[480px] mx-auto">
        <p className="text-sm text-slate-600">제품을 선택한 후 다시 시도하세요.</p>
      </div>
    );
  }

  const minValue = mode === "adj" ? 0 : 1;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value < minValue) {
      setError(
        mode === "adj" ? "0 이상의 목표 수량을 입력하세요." : "1 이상의 수량을 입력하세요.",
      );
      return;
    }
    try {
      await recordTxn(product.id, mode, { amount: value, memo });
      navigate(`/products/${product.id}`, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="px-4 py-4 max-w-[480px] mx-auto space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold text-slate-400">{product.zone}</p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{product.name}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-600">
            수량
            <input
              type="number"
              min={minValue}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-[16px] outline-none focus:border-slate-400"
              required
            />
          </label>
          <p className="text-[12px] text-slate-400">{helpText}</p>
        </div>

        <label className="text-sm text-slate-600">
          메모 (선택)
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-[14px] outline-none focus:border-slate-400"
            placeholder="필요한 비고를 입력하세요."
          />
        </label>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-11 rounded-2xl border border-slate-300 text-slate-700 font-semibold"
          >
            취소
          </button>
          <button type="submit" className="h-11 rounded-2xl bg-slate-900 text-white font-semibold">
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
