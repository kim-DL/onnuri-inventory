import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "@/store/session";
import type { Role } from "@/types/domain";

export default function Protected({ roles }: { roles?: Role[] }) {
  const user = useSessionStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/products" replace />;
  }
  return <Outlet />;
}
