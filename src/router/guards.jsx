// src/router/guards.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ======================
// ROLE CONSTANTS
// ======================
export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  CUSTOMER: "customer",
};

export const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "member" || value === "user" || value === "client" || value === "pemilik") {
    return ROLES.CUSTOMER;
  }
  return value || null;
};

// ======================
// HOME PATH PER ROLE
// ======================
// Satu sumber kebenaran untuk tujuan setelah login / redirect.
//   customer -> halaman member    (/customer)
//   doctor   -> dashboard dokter   (/doctor/jadwal)
//   admin    -> dashboard admin    (/admin)
// Belum login / tidak dikenali -> halaman guest (/)
export const roleHome = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.CUSTOMER) return "/customer";
  if (normalized === ROLES.DOCTOR) return "/doctor";
  if (normalized === ROLES.ADMIN) return "/admin";
  return "/";
};

// ======================
// LOADING SCREEN
// ======================
const LoadingScreen = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        fontWeight: "600",
      }}
    >
      Memuat...
    </div>
  );
};

// ======================
// MAIN GUARD
// ======================
const Guards = ({ children, roles = [] }) => {
  const { loading, isAuthenticated, role } = useAuth();
  const location = useLocation();
  const normalizedRole = normalizeRole(role);

  // Loading auth
  if (loading) {
    return <LoadingScreen />;
  }

  // Belum login, ATAU sesi ada tapi role tidak bisa ditentukan.
  // Arahkan ke login supaya tidak terjebak di layar "Memuat...".
  if (!isAuthenticated || !normalizedRole) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Jika route membutuhkan role tertentu, arahkan ke home sesuai role.
  if (roles.length > 0 && !roles.includes(normalizedRole)) {
    return <Navigate to={roleHome(normalizedRole)} replace />;
  }

  return children;
};

export default Guards;

// ======================
// ROLE REDIRECT (catch-all "*")
// ======================
// - Sudah login  -> home sesuai role (roleHome).
// - Belum login  -> halaman guest (/).
export const RoleRedirect = () => {
  const { loading, isAuthenticated, role } = useAuth();
  const normalizedRole = normalizeRole(role);

  if (loading) return <LoadingScreen />;

  if (isAuthenticated && normalizedRole) {
    return <Navigate to={roleHome(normalizedRole)} replace />;
  }
  return <Navigate to="/" replace />;
};

// ======================
// ROLE GUARDS
// ======================
export const AdminGuard = ({ children }) => (
  <Guards roles={[ROLES.ADMIN]}>{children}</Guards>
);

export const DoctorGuard = ({ children }) => (
  <Guards roles={[ROLES.DOCTOR]}>{children}</Guards>
);

export const CustomerGuard = ({ children }) => (
  <Guards roles={[ROLES.CUSTOMER]}>{children}</Guards>
);

// ======================
// PERMISSIONS
// ======================
export const usePermissions = () => {
  const { role } = useAuth();
  const normalizedRole = normalizeRole(role);

  return {
    role: normalizedRole,
    isAdmin: normalizedRole === ROLES.ADMIN,
    isDoctor: normalizedRole === ROLES.DOCTOR,
    isCustomer: normalizedRole === ROLES.CUSTOMER,
    canManageUsers: normalizedRole === ROLES.ADMIN,
    canManageDoctors: normalizedRole === ROLES.ADMIN,
    canManagePatients: normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.DOCTOR,
    canCreateMedicalRecord: normalizedRole === ROLES.DOCTOR,
    canViewOwnPets: normalizedRole === ROLES.CUSTOMER,
  };
};
