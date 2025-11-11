import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readFileAsDataUrl } from "@/lib/file";
import { useInventoryStore } from "@/store/inventory";
import type { TempZone } from "@/types/domain";

const zones: TempZone[] = ["냉동", "냉장", "상온"];
const units: Array<"개" | "봉" | "박스" | "팩"> = ["개", "봉", "박스", "팩"];

export default function ProductCreate() {
  const navigate = useNavigate();
  const addProduct = useInventoryStore((state) => state.addProduct);
  const [thumb, setThumb] = useState<string>();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    manufacturer: "",
    qty: "1",
    unit: "개" as const,
    spec: "",
    zone: zones[0],
    exp: "",
  });

  const handleFile = async (file?: File) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setThumb(dataUrl);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.exp) {
      setError("필수 항목을 입력하세요.");
      return;
    }
    const qty = Number(form.qty);
    if (!Number.isFinite(qty) || qty < 0) {
      setError("수량은 0 이상의 숫자여야 합니다.");
      return;
    }
    setSaving(true);
    try {
      await addProduct({
        name: form.name,
        manufacturer: form.manufacturer || undefined,
        qty,
        unit: form.unit,
        spec: form.spec || undefined,
        exp: form.exp,
        zone: form.zone,
        thumb,
      });
      navigate("/products");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-4 max-w-[480px] mx-auto space-y-4">
      <header>
        <p className="text-xs font-semibold text-slate-400">신규 등록</p>
        <h1 className="text-2xl font-bold text-slate-900">제품 등록</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 rounded-3xl bg-white border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">썸네일</p>
          <label className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden">
              {thumb ? (
                <img src={thumb} alt="미리보기" className="w-full h-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-[12px] text-slate-400">이미지</div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="text-sm text-slate-500"
            />
          </label>
        </div>

        <div className="space-y-2 rounded-3xl bg-white border border-slate-200 p-4">
          <label className="text-sm text-slate-600">
            제품명 *
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              required
            />
          </label>
          <label className="text-sm text-slate-600">
            제조사
            <input
              value={form.manufacturer}
              onChange={(e) => setForm((prev) => ({ ...prev, manufacturer: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-slate-600">
              수량 *
              <input
                type="number"
                min={0}
                value={form.qty}
                onChange={(e) => setForm((prev) => ({ ...prev, qty: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                required
              />
            </label>
            <label className="text-sm text-slate-600">
              단위 *
              <select
                value={form.unit}
                onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value as typeof prev.unit }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-sm text-slate-600">
            규격/중량
            <input
              value={form.spec}
              onChange={(e) => setForm((prev) => ({ ...prev, spec: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label className="text-sm text-slate-600">
            보관 구분 *
            <div className="mt-2 flex gap-2">
              {zones.map((zone) => {
                const selected = form.zone === zone;
                return (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, zone }))}
                    className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-semibold ${
                      selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {zone}
                  </button>
                );
              })}
            </div>
          </label>
          <label className="text-sm text-slate-600">
            유통기한 *
            <input
              type="date"
              value={form.exp}
              onChange={(e) => setForm((prev) => ({ ...prev, exp: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              required
            />
          </label>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          className="w-full h-12 rounded-3xl bg-slate-900 text-white text-[15px] font-semibold disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "저장 중…" : "등록 완료"}
        </button>
      </form>
      <p className="text-[12px] text-center text-slate-400">
        등록 후에도 입/출고 및 조정 메뉴에서 언제든 수량을 변경할 수 있습니다.
      </p>
    </div>
  );
}
