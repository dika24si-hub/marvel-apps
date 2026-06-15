import { Outlet } from "react-router-dom";
import { FaPaw, FaShieldAlt } from "react-icons/fa";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function AuthLayout() {
  return (
    <div className="ax">
      {/* LEFT — Brand / Hero (hidden di mobile) */}
      <aside className="ax-side">
        {/* decorative orbs */}
        <span className="ax-orb o1" />
        <span className="ax-orb o2" />
        <span className="ax-orb o3" />

        <div className="ax-brand">
          <div className="ax-brand-logo">
            <FaPaw />
          </div>
          <div>
            <h2>VetCare</h2>
            <span>Veterinary Clinic Management</span>
          </div>
        </div>

        <div className="ax-hero">
          <span className="ax-hero-badge">
            <FaShieldAlt /> Terpercaya &amp; Aman
          </span>

          <h1>
            Rawat hewan kesayangan dengan{" "}
            <em>perawatan terbaik</em>.
          </h1>

          <p>
            Platform manajemen klinik dokter hewan yang terintegrasi — dari
            jadwal periksa, rekam medis, hingga pembayaran, semua dalam satu
            tempat.
          </p>

          <div className="ax-stats">
            <div className="ax-stat">
              <strong>12K+</strong>
              <span>Hewan Terdaftar</span>
            </div>
            <div className="ax-stat">
              <strong>98%</strong>
              <span>Kepuasan Klien</span>
            </div>
            <div className="ax-stat">
              <strong>24/7</strong>
              <span>Dukungan</span>
            </div>
          </div>
        </div>

        <div className="ax-quote">
          <p>
            “VetCare benar-benar mengubah cara kami mengelola klinik. Semua data
            pasien rapi dan mudah diakses.”
          </p>
          <div className="ax-quote-by">
            <span className="ax-quote-av">DR</span>
            <div>
              <b>drh. Dina Rahmawati</b>
              <small>Kepala Klinik — PetWell Care</small>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT — Form */}
      <main className="ax-main">
        <div className="ax-topbar">
          <LanguageSwitcher />
        </div>

        <div className="ax-card">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
