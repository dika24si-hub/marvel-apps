// src/components/Sidebar.jsx
import { useState } from "react";
import {
  FaPaw,
  FaTachometerAlt,
  FaDog,
  FaUserMd,
  FaCalendarAlt,
  FaNotesMedical,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaCog,
  FaQuestionCircle,
  FaAngleDown,
  FaAngleLeft,
  FaTags,
  FaStar,
  FaBell,
  FaCrown,
  FaNotesMedical as FaRegisterPet,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

import fotoDika from "../assets/dika.jpg";

import { useLang } from "../i18n/LanguageContext";
import { Tooltip } from "./shadcn";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { t } = useLang();

  const { role, user, profile, logout } = useAuth();

  const [proMode, setProMode] = useState(true);

  // ==========================
  // MENU BERDASARKAN ROLE
  // ==========================

  let general = [];
  let support = [];

  if (role === "customer") {
    // Customer (pemilik hewan): Dashboard sebagai halaman utama,
    // lalu hewan, jadwal, rekam medis, pembayaran.
    general = [
      {
        name: t("sidebar.menu.dashboard"),
        icon: <FaTachometerAlt />,
        path: "/customer",
        tip: t("sidebar.tip.dashboard"),
      },
      {
        name: t("sidebar.menu.daftarHewan"),
        icon: <FaDog />,
        path: "/customer/daftar-hewan",
        tip: t("sidebar.tip.daftarHewan"),
      },
      {
        name: t("sidebar.menu.jadwal"),
        icon: <FaCalendarAlt />,
        path: "/customer/jadwal",
        tip: t("sidebar.tip.jadwal"),
      },
      {
        name: t("sidebar.menu.rekamMedis"),
        icon: <FaNotesMedical />,
        path: "/customer/rekam-medis",
        tip: t("sidebar.tip.rekamMedis"),
      },
      {
        name: t("sidebar.menu.pembayaran"),
        icon: <FaMoneyBillWave />,
        path: "/customer/pembayaran",
        tip: t("sidebar.tip.pembayaran"),
      },
    ];

    // Loyalty & lainnya masuk ke section "support"
    support = [
      {
        name: t("sidebar.menu.promosi"),
        icon: <FaTags />,
        path: "/customer/promosi",
        tip: t("sidebar.tip.promosi"),
      },
      {
        name: "Membership",
        icon: <FaCrown />,
        path: "/customer/membership",
        tip: "Keanggotaan & poin loyalty",
      },
      {
        name: "Notifikasi",
        icon: <FaBell />,
        path: "/customer/notifikasi",
        tip: "Pusat pengingat",
      },
      {
        name: t("sidebar.menu.ulasanDokter"),
        icon: <FaStar />,
        path: "/customer/ulasan-dokter",
        tip: t("sidebar.tip.ulasanDokter"),
      },
    ];
  } else if (role === "doctor") {
    // Dokter hanya melihat menu Jadwal Periksa.
    general = [
      {
        name: t("sidebar.menu.jadwal"),
        icon: <FaCalendarAlt />,
        path: "/doctor/jadwal",
        tip: t("sidebar.tip.jadwal"),
      },
    ];

    support = [];
  } else {
    // Admin melihat menu lengkap (tanpa jadwal — dipindah ke dokter).
    general = [
      {
        name: t("sidebar.menu.dashboard"),
        icon: <FaTachometerAlt />,
        path: "/",
        tip: t("sidebar.tip.dashboard"),
      },
      {
        name: t("sidebar.menu.pembayaran"),
        icon: <FaMoneyBillWave />,
        path: "/pembayaran",
        tip: t("sidebar.tip.pembayaran"),
      },
      {
        name: t("sidebar.menu.hewan"),
        icon: <FaDog />,
        path: "/hewan",
        tip: t("sidebar.tip.hewan"),
      },
    ];

    support = [
      {
        name: t("sidebar.menu.dokter"),
        icon: <FaUserMd />,
        path: "/dokter",
        tip: t("sidebar.tip.dokter"),
      },
      {
        name: t("sidebar.menu.rekamMedis"),
        icon: <FaNotesMedical />,
        path: "/rekam-medis",
        tip: t("sidebar.tip.rekamMedis"),
      },
    ];
  }

  // ==========================
  // LOGOUT
  // ==========================

  const handleLogout = async () => {
    const ok = window.confirm(t("sidebar.logoutConfirm"));
    if (!ok) return;

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = (menu, idx) => (
    <Tooltip key={idx} content={menu.tip} side="right">
      <NavLink
        to={menu.path}
        end={menu.path === "/" || menu.path === "/customer"}
        className={({ isActive }) =>
          isActive ? "menu-item active" : "menu-item"
        }
      >
        <span className="m-icon">{menu.icon}</span>
        <span className="m-label">{menu.name}</span>
        {menu.badge && <span className="menu-badge">{menu.badge}</span>}
      </NavLink>
    </Tooltip>
  );

  // Label role untuk ditampilkan di profil
  const roleLabel =
    role === "admin"
      ? "Admin"
      : role === "doctor"
      ? t("sidebar.role")
      : role === "customer"
      ? t("sidebar.customerRole")
      : "";

  return (
    <aside className="sidebar">
      {/* BRAND */}
      <div className="brand">
        <div className="brand-left">
          <div className="brand-icon">
            <FaPaw />
          </div>
          <h2>{t("app.name")}</h2>
        </div>

        <button className="brand-collapse" type="button" aria-label="Collapse">
          <FaAngleLeft />
        </button>
      </div>

      {/* GENERAL */}
      <div className="menu-section">{t("sidebar.sections.general")}</div>
      <nav className="menu">{general.map(renderItem)}</nav>

      {/* SUPPORT — hanya admin, dokter & customer */}
      {support.length > 0 && (
        <>
          <div className="menu-section">{t("sidebar.sections.support")}</div>
          <nav className="menu">{support.map(renderItem)}</nav>
        </>
      )}

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        <button type="button" className="menu-item static">
          <span className="m-icon">
            <FaCog />
          </span>
          <span className="m-label">{t("sidebar.menu.settings")}</span>
        </button>

        <button type="button" className="menu-item static">
          <span className="m-icon">
            <FaQuestionCircle />
          </span>
          <span className="m-label">{t("sidebar.menu.help")}</span>
        </button>

        <div className="pro-mode">
          <span className="m-icon">⚡</span>
          <span className="m-label">{t("sidebar.proMode")}</span>
          <Tooltip
            content={proMode ? "Pro Mode aktif" : "Pro Mode nonaktif"}
            side="top"
          >
            <button
              type="button"
              className={`toggle ${proMode ? "" : "off"}`}
              onClick={() => setProMode((p) => !p)}
              aria-label="Toggle Pro Mode"
            />
          </Tooltip>
        </div>

        <Tooltip content="Keluar dari akun VetCare" side="right">
          <button
            type="button"
            className="menu-item logout"
            onClick={handleLogout}
          >
            <span className="m-icon">
              <FaSignOutAlt />
            </span>
            <span className="m-label">{t("sidebar.logout")}</span>
          </button>
        </Tooltip>

        <div className="sidebar-profile">
          <img src={fotoDika} alt="Profile" />
          <div className="meta">
            <b>{profile?.full_name || "VetCare User"}</b>
            <small>{roleLabel || user?.email || "user@vetcare.com"}</small>
          </div>
          <FaAngleDown className="chev" />
        </div>

        <div className="sidebar-footer">{t("app.copyright")}</div>
      </div>
    </aside>
  );
}