import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import MainLayout from "../layouts/MainLayout";
import CustomerLayout from "../layouts/CustomerLayout";

import Loading from "../components/Loading";
import Guards, { ROLES, RoleRedirect } from "./guards";

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
const DashboardCustomer = lazy(() => import("../pages/customer/DashboardCustomer"));
const CustomerPromosi = lazy(() => import("../pages/customer/CustomerPromosi"));
const CustomerDaftarHewan = lazy(() => import("../pages/customer/CustomerDaftarHewan"));
const PetDetail = lazy(() => import("../pages/customer/PetDetail"));
const CustomerUlasanDokter = lazy(() => import("../pages/customer/CustomerUlasanDokter"));
const CustomerJadwal = lazy(() => import("../pages/customer/CustomerJadwal"));
const CustomerRekamMedis = lazy(() => import("../pages/customer/CustomerRekamMedis"));
const CustomerPembayaran = lazy(() => import("../pages/customer/CustomerPembayaran"));
const CustomerKeanggotaan = lazy(() => import("../pages/customer/CustomerKeanggotaan"));
const CustomerNotifikasi = lazy(() => import("../pages/customer/CustomerNotifikasi"));

// ======================
// PAGES — AUTH & GUEST
// ======================
const AuthSlider = lazy(() => import("../pages/auth/AuthSlider"));
const GuestHome = lazy(() => import("../pages/guest/GuestHome"));

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* ============================= */}
        {/* GUEST / LANDING (PUBLIK)      */}
        {/* ============================= */}
        <Route path="/" element={<GuestHome />} />
        <Route path="/guest" element={<GuestHome />} />

        {/* ============================= */}
        {/* AUTH ROUTES                   */}
        {/* ============================= */}
        <Route path="/login" element={<AuthSlider />} />
        <Route path="/register" element={<AuthSlider />} />

        {/* ============================= */}
        {/* ADMIN ROUTES                  */}
        {/* ============================= */}
        <Route
          element={
            <Guards roles={[ROLES.ADMIN]}>
              <MainLayout />
            </Guards>
          }
        >
          <Route path="/admin" element={<Dashboard />} />
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
              <CustomerLayout />
            </Guards>
          }
        >
          <Route path="/customer" element={<DashboardCustomer />} />
          <Route path="/customer/daftar-hewan" element={<CustomerDaftarHewan />} />
          <Route path="/customer/hewan/:id" element={<PetDetail />} />
          <Route path="/customer/jadwal" element={<CustomerJadwal />} />
          <Route path="/customer/rekam-medis" element={<CustomerRekamMedis />} />
          <Route path="/customer/pembayaran" element={<CustomerPembayaran />} />
          <Route path="/customer/promosi" element={<CustomerPromosi />} />
          <Route path="/customer/membership" element={<CustomerKeanggotaan />} />
          <Route path="/customer/notifikasi" element={<CustomerNotifikasi />} />
          <Route path="/customer/ulasan-dokter" element={<CustomerUlasanDokter />} />
        </Route>

        {/* NOT FOUND — arahkan sesuai status login & role */}
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </Suspense>
  );
}