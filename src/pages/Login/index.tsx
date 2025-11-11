import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/store/session";
import { useInventoryStore } from "@/store/inventory";

export default function Login() {
  const navigate = useNavigate();
  const ready = useInventoryStore((state) => state.ready);
  const bootstrap = useInventoryStore((state) => state.bootstrap);
  const user = useSessionStore((state) => state.user);
  const login = useSessionStore((state) => state.login);
  const loggingIn = useSessionStore((state) => state.loggingIn);
  const error = useSessionStore((state) => state.error);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (user) navigate("/products", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login(username, password);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl space-y-6">
        <header className="space-y-1 text-center">
          <p className="text-xs font-semibold text-slate-400">온누리 재고 관리 시스템</p>
          <h1 className="text-2xl font-bold text-slate-900">로그인</h1>
          <p className="text-[13px] text-slate-500">관리자가 발급한 계정 정보를 입력하세요.</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="space-y-1 text-sm text-slate-600">
            아이디
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-[14px] outline-none focus:border-slate-400"
              autoComplete="username"
              required
              disabled={!ready || loggingIn}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-[14px] outline-none focus:border-slate-400"
              autoComplete="current-password"
              required
              disabled={!ready || loggingIn}
            />
          </label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            className="w-full h-11 rounded-2xl bg-slate-900 text-white font-semibold disabled:opacity-50"
            disabled={!ready || loggingIn}
          >
            {loggingIn ? "확인 중…" : "로그인"}
          </button>
          <p className="text-[12px] text-center text-slate-400">
            기본 관리자 계정: <span className="font-semibold text-slate-600">admin / admin1234</span>
          </p>
        </form>
      </div>
    </div>
  );
}
