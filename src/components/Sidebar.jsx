// src/components/Sidebar.jsx
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
  FaAngleDown,
  FaAngleLeft,
  FaTags,
  FaStar,
  FaBell,
  FaCrown,
  FaUsers,
  FaBullhorn,
  FaLayerGroup,
  FaChartLine,
  FaCommentDots,
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
    // Dokter: dashboard, jadwal, pasien, rekam medis, konsultasi, laporan.
    general = [
      {
        name: t("sidebar.menu.dashboard"),
        icon: <FaTachometerAlt />,
        path: "/doctor",
        tip: "Ringkasan praktik",
      },
      {
        name: t("sidebar.menu.jadwal"),
        icon: <FaCalendarAlt />,
        path: "/doctor/jadwal",
        tip: t("sidebar.tip.jadwal"),
      },
      {
        name: "Pasien",
        icon: <FaDog />,
        path: "/doctor/pasien",
        tip: "Data hewan & pemilik",
      },
      {
        name: t("sidebar.menu.rekamMedis"),
        icon: <FaNotesMedical />,
        path: "/doctor/rekam-medis",
        tip: t("sidebar.tip.rekamMedis"),
      },
    ];

    support = [
      {
        name: "Konsultasi",
        icon: <FaCommentDots />,
        path: "/doctor/konsultasi",
        tip: "Inbox konsultasi online",
      },
      {
        name: "Laporan",
        icon: <FaChartLine />,
        path: "/doctor/laporan",
        tip: "Statistik & laporan",
      },
      {
        name: "Profil",
        icon: <FaUserMd />,
        path: "/doctor/profil",
        tip: "Profil dokter",
      },
      {
        name: "Ulasan Saya",
        icon: <FaStar />,
        path: "/doctor/ulasan",
        tip: "Ulasan & rating dari pasien",
      },
    ];
  } else {
    // Admin melihat menu lengkap (tanpa jadwal — dipindah ke dokter).
    general = [
      {
        name: t("sidebar.menu.dashboard"),
        icon: <FaTachometerAlt />,
        path: "/admin",
        tip: t("sidebar.tip.dashboard"),
      },
      {
        name: "Appointment",
        icon: <FaCalendarAlt />,
        path: "/appointment",
        tip: "Semua janji temu klinik",
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
        name: "Member",
        icon: <FaUsers />,
        path: "/member",
        tip: "Kelola akun pemilik hewan",
      },
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
      {
        name: "Layanan & Harga",
        icon: <FaTags />,
        path: "/layanan",
        tip: "Katalog layanan & tarif",
      },
      {
        name: "CRM Analytics",
        icon: <FaChartLine />,
        path: "/analytics",
        tip: "Insight & laporan bisnis",
      },
      {
        name: "Segmentasi RFM",
        icon: <FaLayerGroup />,
        path: "/segmentasi",
        tip: "RFM & lifecycle pelanggan",
      },
      {
        name: "Loyalty",
        icon: <FaCrown />,
        path: "/loyalty",
        tip: "Reward & penukaran poin",
      },
      {
        name: "Kampanye",
        icon: <FaBullhorn />,
        path: "/kampanye",
        tip: "Email campaign & voucher",
      },
      {
        name: "Feedback",
        icon: <FaStar />,
        path: "/ulasan",
        tip: "Ulasan, rating & NPS",
      },
      {
        name: "Pengaturan",
        icon: <FaCog />,
        path: "/pengaturan",
        tip: "Pengaturan sistem & klinik",
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
        end={menu.path === "/admin" || menu.path === "/customer" || menu.path === "/doctor"}
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