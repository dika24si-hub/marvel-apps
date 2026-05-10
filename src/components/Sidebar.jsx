import {
  FaPaw,
  FaTachometerAlt,
  FaDog,
  FaUserMd,
  FaCalendarAlt,
  FaNotesMedical,
  FaMoneyBillWave,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import fotoDika from "../assets/dika.jpg";
import { useLang } from "../i18n/LanguageContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { t } = useLang();

  const menus = [
    { name: t("sidebar.menu.dashboard"), icon: <FaTachometerAlt />, path: "/" },
    { name: t("sidebar.menu.hewan"), icon: <FaDog />, path: "/hewan" },
    { name: t("sidebar.menu.dokter"), icon: <FaUserMd />, path: "/dokter" },
    { name: t("sidebar.menu.jadwal"), icon: <FaCalendarAlt />, path: "/jadwal" },
    { name: t("sidebar.menu.rekamMedis"), icon: <FaNotesMedical />, path: "/rekam-medis" },
    { name: t("sidebar.menu.pembayaran"), icon: <FaMoneyBillWave />, path: "/pembayaran" },
  ];

  const handleLogout = () => {
    const ok = window.confirm(t("sidebar.logoutConfirm"));
    if (!ok) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <FaPaw />
        </div>
        <h2>{t("app.name")}</h2>
      </div>

      <div className="profile-box">
        <img src={fotoDika} alt="Dr Dika" className="profile-img" />
        <h4>Dr. Dika</h4>
        <p>{t("sidebar.role")}</p>
      </div>

      <nav className="menu">
        {menus.map((menu, index) => (
          <NavLink
            key={index}
            to={menu.path}
            end={menu.path === "/"}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span>{menu.icon}</span>
            {menu.name}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="logout-box" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>{t("sidebar.logout")}</span>
      </button>
    </aside>
  );
}
