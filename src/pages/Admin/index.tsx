import { FormEvent, useState } from "react";
import { useInventoryStore } from "@/store/inventory";
import { useSessionStore } from "@/store/session";

export default function Admin() {
  const users = useInventoryStore((state) => state.users);
  const addUser = useInventoryStore((state) => state.addUser);
  const toggleUser = useInventoryStore((state) => state.toggleUser);
  const exportCsv = useInventoryStore((state) => state.exportCsv);
  const backup = useInventoryStore((state) => state.backup);
  const restore = useInventoryStore((state) => state.restore);
  const products = useInventoryStore((state) => state.products);
  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    role: "staff" as "staff" | "admin",
  });
  const [error, setError] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const me = useSessionStore((state) => state.user);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await addUser(form);
      setForm({ username: "", name: "", password: "", role: "staff" });
      setError(undefined);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleRestore = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      await restore(file);
      setError(undefined);
    } catch (err) {
      setError("복원 실패: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-4 py-4 max-w-[640px] mx-auto space-y-4">
      <header>
        <p className="text-xs font-semibold text-slate-400">관리자</p>
        <h1 className="text-2xl font-bold text-slate-900">계정 & 데이터 관리</h1>
      </header>

      <section className="rounded-3xl bg-white border border-slate-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">직원 계정</h2>
          <span className="text-sm text-slate-500">{users.length}명</span>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            아이디
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              required
            />
          </label>
          <label className="text-sm text-slate-600">
            이름
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              required
            />
          </label>
          <label className="text-sm text-slate-600">
            임시 비밀번호
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              required
              minLength={4}
            />
          </label>
          <label className="text-sm text-slate-600">
            권한
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as "staff" | "admin" }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="staff">직원</option>
              <option value="admin">관리자</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="w-full h-11 rounded-2xl bg-slate-900 text-white font-semibold">
              계정 추가
            </button>
          </div>
        </form>
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">
                  {user.username} · {user.role}
                </p>
              </div>
              {user.role !== "admin" && user.id !== me?.id ? (
                <button
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.active
                      ? "border border-amber-500 text-amber-600"
                      : "border border-slate-300 text-slate-500"
                  }`}
                >
                  {user.active ? "비활성화" : "활성화"}
                </button>
              ) : (
                <span className="text-xs text-slate-400">고정</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-white border border-slate-200 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">데이터 도구</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => exportCsv(products)}
            className="h-11 flex-1 rounded-2xl border border-slate-300 text-slate-800 font-semibold min-w-[140px]"
          >
            CSV 내보내기
          </button>
          <button
            type="button"
            onClick={backup}
            className="h-11 flex-1 rounded-2xl border border-slate-300 text-slate-800 font-semibold min-w-[140px]"
          >
            백업 다운로드
          </button>
          <label className="h-11 flex-1 rounded-2xl border border-slate-300 text-slate-800 font-semibold min-w-[140px] grid place-items-center cursor-pointer">
            <span>{uploading ? "복원 중…" : "백업 복원"}</span>
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => handleRestore(e.target.files?.[0])}
              disabled={uploading}
            />
          </label>
        </div>
        <p className="text-[12px] text-slate-400">
          CSV 컬럼: 품명, 제조사, 수량, 단위, 규격/중량, 보관구분, 유통기한, D-일수, 최근수정, 비고
        </p>
      </section>
    </div>
  );
}
