import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import Loading from "../components/Loading";
import { ProtectedRoute, GuestRoute } from "./guards";

// Lazy hanya di level page — inilah yang beneran memberi keuntungan code splitting
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Hewan = lazy(() => import("../pages/Hewan"));
const HewanDetail = lazy(() => import("../pages/HewanDetail"));
const Dokter = lazy(() => import("../pages/Dokter"));
const DokterDetail = lazy(() => import("../pages/DokterDetail"));
const Jadwal = lazy(() => import("../pages/Jadwal"));
const RekamMedis = lazy(() => import("../pages/RekamMedis"));
const Pembayaran = lazy(() => import("../pages/Pembayaran"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const Forgot = lazy(() => import("../pages/auth/Forgot"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* PRIVATE ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/hewan" element={<Hewan />} />
              <Route path="/hewan/:id" element={<HewanDetail />} />
              <Route path="/dokter" element={<Dokter />} />
              <Route path="/dokter/:id" element={<DokterDetail />} />
              <Route path="/jadwal" element={<Jadwal />} />
              <Route path="/rekam-medis" element={<RekamMedis />} />
              <Route path="/pembayaran" element={<Pembayaran />} />
            </Route>
          </Route>

          {/* GUEST ROUTES */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot" element={<Forgot />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
