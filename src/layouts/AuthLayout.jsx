import { Outlet } from "react-router-dom";
import {
  FaPaw,
  FaStethoscope,
  FaUserMd,
  FaHeartbeat,
  FaShieldAlt,
} from "react-icons/fa";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function AuthLayout() {
  return (
    <div className="auth-pro">
      {/* LEFT — Branding Panel (hidden di mobile) */}
      <aside className="auth-pro-side">
        <div className="auth-pro-brand">
          <div className="auth-pro-logo">
            <FaPaw />
          </div>
          <h2>VetCare</h2>
        </div>

        <div className="auth-pro-hero">
          <h1>
            Kelola klinik hewan Anda dengan
            <br />
            <span>lebih profesional</span>.
          </h1>
          <p>
            Platform manajemen terintegrasi untuk klinik dokter hewan — mulai
            dari data hewan, jadwal periksa, rekam medis, hingga pembayaran.
          </p>
        </div>

        <ul className="auth-pro-features">
          <li>
            <span className="feat-ic blue">
              <FaStethoscope />
            </span>
            <div>
              <b>Pemeriksaan Terpadu</b>
              <small>Catatan medis langsung tersimpan rapi.</small>
            </div>
          </li>
          <li>
            <span className="feat-ic teal">
              <FaUserMd />
            </span>
            <div>
              <b>Manajemen Dokter</b>
              <small>Atur jadwal & spesialisasi dengan mudah.</small>
            </div>
          </li>
          <li>
            <span className="feat-ic orange">
              <FaHeartbeat />
            </span>
            <div>
              <b>Laporan Real-time</b>
              <small>Pantau performa klinik setiap saat.</small>
            </div>
          </li>
        </ul>

        <div className="auth-pro-secure">
          <FaShieldAlt />
          Data klinik Anda terenkripsi & aman.
        </div>

        {/* Decorative shapes */}
        <span className="auth-blob b1" />
        <span className="auth-blob b2" />
      </aside>

      {/* RIGHT — Form */}
      <main className="auth-pro-main">
        <div className="auth-pro-topbar">
          <LanguageSwitcher />
        </div>

        <div className="auth-pro-card">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
