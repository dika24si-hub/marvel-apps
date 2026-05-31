import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import Loading from "../components/Loading";
import Guards from "./guards";

// Lazy hanya di level page
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Hewan = lazy(() => import("../pages/Hewan"));
const Dokter = lazy(() => import("../pages/Dokter"));
const DokterDetail = lazy(() => import("../pages/DokterDetail"));
const Jadwal = lazy(() => import("../pages/Jadwal"));
const RekamMedis = lazy(() => import("../pages/RekamMedis"));
const Pembayaran = lazy(() => import("../pages/Pembayaran"));
const Login = lazy(() => import("../pages/auth/Login"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* PRIVATE ROUTES — wajib login */}
          <Route
            element={
              <Guards>
                <MainLayout />
              </Guards>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/hewan" element={<Hewan />} />
            <Route path="/dokter" element={<Dokter />} />
            <Route path="/dokter/:id" element={<DokterDetail />} />
            <Route path="/jadwal" element={<Jadwal />} />
            <Route path="/rekam-medis" element={<RekamMedis />} />
            <Route path="/pembayaran" element={<Pembayaran />} />
          </Route>

          {/* PUBLIC ROUTES */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
