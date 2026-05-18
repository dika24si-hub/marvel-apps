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
  FaExchangeAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import fotoDika from "../assets/dika.jpg";
import { useLang } from "../i18n/LanguageContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [proMode, setProMode] = useState(true);

  const general = [
    { name: t("sidebar.menu.dashboard"), icon: <FaTachometerAlt />, path: "/" },
    { name: t("sidebar.menu.pembayaran"), icon: <FaMoneyBillWave />, path: "/pembayaran" },
    { name: t("sidebar.menu.jadwal"), icon: <FaCalendarAlt />, path: "/jadwal" },
    { name: t("sidebar.menu.hewan"), icon: <FaDog />, path: "/hewan" },
  ];

  const support = [
    { name: t("sidebar.menu.dokter"), icon: <FaUserMd />, path: "/dokter" },
    { name: t("sidebar.menu.rekamMedis"), icon: <FaNotesMedical />, path: "/rekam-medis" },
  ];

  const handleLogout = () => {
    const ok = window.confirm(t("sidebar.logoutConfirm"));
    if (!ok) return;
    localStorage.removeItem("isLogin");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const renderItem = (menu, idx) => (
    <NavLink
      key={idx}
      to={menu.path}
      end={menu.path === "/"}
      className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}
    >
      <span className="m-icon">{menu.icon}</span>
      <span className="m-label">{menu.name}</span>
      {menu.badge && <span className="menu-badge">{menu.badge}</span>}
    </NavLink>
  );

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

      {/* SUPPORT */}
      <div className="menu-section">{t("sidebar.sections.support")}</div>
      <nav className="menu">
        {support.map(renderItem)}
        {/* Promo item — bukan link, hanya badge */}
        <div className="menu-item static">
          <span className="m-icon"><FaExchangeAlt /></span>
          <span className="m-label">{t("sidebar.menu.promo")}</span>
          <span className="menu-badge">€150</span>
        </div>
      </nav>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        {/* Pakai <button> supaya tidak match active state seperti NavLink */}
        <button type="button" className="menu-item static">
          <span className="m-icon"><FaCog /></span>
          <span className="m-label">{t("sidebar.menu.settings")}</span>
        </button>
        <button type="button" className="menu-item static">
          <span className="m-icon"><FaQuestionCircle /></span>
          <span className="m-label">{t("sidebar.menu.help")}</span>
        </button>

        <div className="pro-mode">
          <span className="m-icon">⚡</span>
          <span className="m-label">{t("sidebar.proMode")}</span>
          <button
            type="button"
            className={`toggle ${proMode ? "" : "off"}`}
            onClick={() => setProMode((p) => !p)}
            aria-label="Toggle Pro Mode"
          />
        </div>

        <button type="button" className="menu-item logout" onClick={handleLogout}>
          <span className="m-icon"><FaSignOutAlt /></span>
          <span className="m-label">{t("sidebar.logout")}</span>
        </button>

        <div className="sidebar-profile">
          <img src={fotoDika} alt="Dr Dika" />
          <div className="meta">
            <b>Dr. Dika</b>
            <small>dika@vetcare.id</small>
          </div>
          <FaAngleDown className="chev" />
        </div>

        <div className="sidebar-footer">{t("app.copyright")}</div>
      </div>
    </aside>
  );
}
