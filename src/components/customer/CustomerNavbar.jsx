// src/components/customer/CustomerNavbar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaPaw, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";

import fotoDika from "../../assets/dika.jpg";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { label: "Dashboard", to: "/customer" },
  { label: "Hewan", to: "/customer/daftar-hewan" },
  { label: "Jadwal", to: "/customer/jadwal" },
  { label: "Rekam Medis", to: "/customer/rekam-medis" },
  { label: "Pembayaran", to: "/customer/pembayaran" },
  { label: "Membership", to: "/customer/membership" },
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
        <div className="cust-nav-user">
          <img src={fotoDika} alt="Profil" />
        </div>
        <button type="button" className="cust-nav-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Log Out</span>
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
