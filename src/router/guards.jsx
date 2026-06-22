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

// ======================
// HOME PATH PER ROLE
// ======================
// Satu sumber kebenaran untuk tujuan setelah login / redirect.
//   customer -> halaman member          (/customer)
//   doctor   -> dashboard dokter         (/doctor/jadwal)
//   admin    -> dashboard admin          (/)
// Dipakai di AuthSlider (setelah login) & Guards (proteksi lintas-role).

export const roleHome = (role) => {
  if (role === ROLES.CUSTOMER) return "/customer";
  if (role === ROLES.DOCTOR) return "/doctor/jadwal";
  if (role === ROLES.ADMIN) return "/";
  return "/login"; // role tidak dikenali / belum login
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

  // Loading auth
  if (loading) {
    return <LoadingScreen />;
  }

  // Belum login, ATAU sesi ada tapi role tidak bisa ditentukan
  // (mis. profil gagal dimuat karena jaringan). Arahkan ke login
  // supaya tidak terjebak di layar "Memuat...".
  if (!isAuthenticated || !role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // Jika route membutuhkan role tertentu, arahkan ke home sesuai role.
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return children;
};

export default Guards;

// ======================
// ROLE REDIRECT
// ======================
// Dipakai untuk route catch-all "*" (URL tidak dikenal).
// - Sudah login  -> diarahkan ke home sesuai role (roleHome).
// - Belum login  -> diarahkan ke /login.
// Mencegah user yang sudah login "memantul" lewat /login saat salah URL.

export const RoleRedirect = () => {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading) return <LoadingScreen />;

  if (isAuthenticated && role) {
    return <Navigate to={roleHome(role)} replace />;
  }
  return <Navigate to="/login" replace />;
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

  return {
    role,

    isAdmin: role === ROLES.ADMIN,

    isDoctor: role === ROLES.DOCTOR,

    isCustomer: role === ROLES.CUSTOMER,

    canManageUsers: role === ROLES.ADMIN,

    canManageDoctors: role === ROLES.ADMIN,

    canManagePatients: role === ROLES.ADMIN || role === ROLES.DOCTOR,

    canCreateMedicalRecord: role === ROLES.DOCTOR,

    canViewOwnPets: role === ROLES.CUSTOMER,
  };
};