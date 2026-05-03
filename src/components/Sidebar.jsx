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
import { NavLink } from "react-router-dom";
import fotoDika from "../assets/dika.jpg"; // ✅ IMPORT FOTO

export default function Sidebar() {
  const menus = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/" },
    { name: "Data Hewan", icon: <FaDog />, path: "/hewan" },
    { name: "Dokter Hewan", icon: <FaUserMd />, path: "/dokter" },
    { name: "Jadwal Periksa", icon: <FaCalendarAlt />, path: "/jadwal" },
    { name: "Rekam Medis", icon: <FaNotesMedical />, path: "/rekam-medis" },
    { name: "Pembayaran", icon: <FaMoneyBillWave />, path: "/pembayaran" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <FaPaw />
        </div>
        <h2>VetCare</h2>
      </div>

      <div className="profile-box">
        <img
          src={fotoDika}
          alt="Dr Dika"
          className="profile-img"
        />
        <h4>Dr. Dika</h4>
        <p>Veterinarian</p>
      </div>

      <nav className="menu">
        {menus.map((menu, index) => (
          <NavLink
            key={index}
            to={menu.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span>{menu.icon}</span>
            {menu.name}
          </NavLink>
        ))}
      </nav>

      <div className="logout-box">
        <FaSignOutAlt />
        <span>Logout</span>
      </div>
    </aside>
  );
}