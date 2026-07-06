// src/components/customer/CustomerNavbar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaPaw, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

// Komponen avatar inisial — ditampilkan ketika belum ada foto profil
const InitialAvatar = ({ name, size = 36 }) => {
  const initials = (name || "U")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, #14b8a6, #0ea5e9)",
        color: "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: size * 0.38,
        fontWeight: 700, flexShrink: 0, userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
};

const LINKS = [
  { label: "Dashboard", to: "/customer" },
  { label: "Hewan", to: "/customer/daftar-hewan" },
  { label: "Jadwal", to: "/customer/jadwal" },
  { label: "Rekam Medis", to: "/customer/rekam-medis" },
  { label: "Konsultasi", to: "/customer/konsultasi" },
  { label: "Pembayaran", to: "/customer/pembayaran" },
  { label: "Membership", to: "/customer/membership" },
  { label: "Ulasan Dokter", to: "/customer/ulasan-dokter" },
];

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const { profile, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const ok = window.confirm("Keluar dari akun VetCare?");
    if (!ok) return;
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="cust-nav">
      <NavLink to="/customer" end className="cust-nav-logo">
        <FaPaw className="cust-nav-logo-ic" />
        <span>VetCare</span>
      </NavLink>

      <ul className={`cust-nav-links ${open ? "open" : ""}`}>
        {LINKS.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === "/customer"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="cust-nav-right">
        <NavLink to="/customer/profil" className="cust-nav-user" title="Profil Saya">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profil"
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <InitialAvatar name={profile?.full_name} size={36} />
          )}
        </NavLink>
        <button type="button" className="cust-nav-logout" onClick={handleLogout} title="Log Out" aria-label="Log Out">
          <FaSignOutAlt />
        </button>
        <button
          type="button"
          className="cust-nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* nama user disembunyikan dari layout utama, dipakai a11y/title */}
      <span className="sr-only">
        {profile?.full_name || user?.email || "Customer"}
      </span>
    </nav>
  );
}
