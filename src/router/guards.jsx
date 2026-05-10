import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Guard untuk halaman yang WAJIB login.
 * Tidak ada token → lempar ke /login.
 */
export function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/**
 * Guard untuk halaman auth (login, register, forgot).
 * Sudah login → lempar ke dashboard.
 */
export function GuestRoute() {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}
