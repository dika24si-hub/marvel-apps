import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Footer } from "../components/ui";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <main className="page-content">
          <Outlet />
        </main>

        {/* 🟢 Komponen #12 Footer — muncul di semua halaman dalam Main layout */}
        <Footer
          left="© 2026 VetCare Animal Clinic"
          right={<span>v1.0.0 • Sistem Manajemen Klinik Hewan</span>}
        />
      </div>
    </div>
  );
}
