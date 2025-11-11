import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db, userStore } from "@/lib/db";
import { hashString } from "@/lib/hash";
import type { Role, User } from "@/types/domain";
import { useInventoryStore } from "./inventory";

type SessionState = {
  user: Pick<User, "id" | "name" | "role"> | null;
  loggingIn: boolean;
  error?: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      loggingIn: false,
      error: undefined,
      async login(username, password) {
        set({ loggingIn: true, error: undefined });
        const [candidate] = (await db.getAll<User>(userStore)).filter((u) => u.username === username);
        if (!candidate) {
          set({ loggingIn: false, error: "계정을 찾을 수 없습니다." });
          return;
        }
        if (!candidate.active) {
          set({ loggingIn: false, error: "비활성화된 계정입니다." });
          return;
        }
        const passwordHash = await hashString(password);
        if (candidate.passwordHash !== passwordHash) {
          set({ loggingIn: false, error: "비밀번호가 올바르지 않습니다." });
          return;
        }
        set({
          loggingIn: false,
          user: { id: candidate.id, name: candidate.name, role: candidate.role },
          error: undefined,
        });
        await useInventoryStore.getState().refresh();
      },
      logout() {
        set({ user: null });
      },
    }),
    {
      name: "onnuri-session",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export const useRoleGuard = (roles?: Role[]) => {
  const user = useSessionStore((state) => state.user);
  if (!user) return false;
  if (!roles) return true;
  return roles.includes(user.role);
};
