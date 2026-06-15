import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  lazy,
  Suspense,
} from "react";

import MainLayout from "../layouts/MainLayout";


import Loading from "../components/Loading";
import Guards, { ROLES } from "./guards";

// ======================
// PAGES — ADMIN & DOKTER
// ======================

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Hewan = lazy(() => import("../pages/Hewan"));
const Dokter = lazy(() => import("../pages/Dokter"));
const DokterDetail = lazy(() => import("../pages/DokterDetail"));
const Jadwal = lazy(() => import("../pages/Jadwal"));
const RekamMedis = lazy(() => import("../pages/RekamMedis"));
const Pembayaran = lazy(() => import("../pages/Pembayaran"));

// ======================
// PAGES — CUSTOMER
// ======================

const DashboardCustomer = lazy(() =>
  import("../pages/customer/DashboardCustomer")
);
const CustomerPromosi = lazy(() =>
  import("../pages/customer/CustomerPromosi")
);
const CustomerDaftarHewan = lazy(() =>
  import("../pages/customer/CustomerDaftarHewan")
);
const CustomerUlasanDokter = lazy(() =>
  import("../pages/customer/CustomerUlasanDokter")
);

// ======================
// PAGES — AUTH
// ======================

const AuthSlider = lazy(() => import("../pages/auth/AuthSlider"));


export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* ============================= */}
        {/* ADMIN & DOKTER ROUTES         */}
        {/* ============================= */}
        <Route
          element={
            <Guards roles={[ROLES.ADMIN]}>
              <MainLayout />
            </Guards>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/hewan" element={<Hewan />} />
          <Route path="/dokter" element={<Dokter />} />
          <Route path="/dokter/:id" element={<DokterDetail />} />
          <Route path="/rekam-medis" element={<RekamMedis />} />
          <Route path="/pembayaran" element={<Pembayaran />} />
        </Route>

        {/* ============================= */}
        {/* DOKTER ROUTES                 */}
        {/* ============================= */}
        <Route
          element={
            <Guards roles={[ROLES.DOCTOR]}>
              <MainLayout />
            </Guards>
          }
        >
          <Route path="/doctor/jadwal" element={<Jadwal />} />
        </Route>

        {/* ============================= */}
        {/* CUSTOMER ROUTES               */}
        {/* ============================= */}
        <Route
          element={
            <Guards roles={[ROLES.CUSTOMER]}>
              <MainLayout />
            </Guards>
          }
        >
          <Route
            path="/customer/pembayaran"
            element={<DashboardCustomer />}
          />
          <Route
            path="/customer/promosi"
            element={<CustomerPromosi />}
          />
          <Route
            path="/customer/daftar-hewan"
            element={<CustomerDaftarHewan />}
          />
          <Route
            path="/customer/ulasan-dokter"
            element={<CustomerUlasanDokter />}
          />
        </Route>

        {/* ============================= */}
        {/* AUTH ROUTES                   */}
        {/* ============================= */}
        <Route path="/login" element={<AuthSlider />} />
        <Route path="/register" element={<AuthSlider />} />


        {/* NOT FOUND */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </Suspense>
  );
}
