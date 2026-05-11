import {
  FaTachometerAlt,
  FaUserMd,
  FaDog,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileMedical,
  FaSignOutAlt,
} from "react-icons/fa";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import "./sidebar.css";

const Sidebar = () => {

  const navigate = useNavigate();

  // LOGOUT
  const handleLogout = () => {

    const confirmLogout =
      window.confirm(
        "Apakah kamu yakin ingin logout?"
      );

    if(confirmLogout){

      localStorage.removeItem(
        "isLogin"
      );

      navigate("/login");
    }
  };

  return (

    <aside className="sidebar">

      {/* TOP */}
      <div>

        <h1 className="logo">
          VetCare
        </h1>

        <p className="sidebar-title">
          MAIN MENU
        </p>

        <div className="menu">

          {/* DASHBOARD */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaTachometerAlt />
            Dashboard
          </NavLink>

          {/* DOKTER */}
          <NavLink
            to="/dokter"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaUserMd />
            Dokter
          </NavLink>

          {/* HEWAN */}
          <NavLink
            to="/hewan"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaDog />
            Hewan
          </NavLink>

          {/* JADWAL */}
          <NavLink
            to="/jadwal"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaCalendarAlt />
            Jadwal
          </NavLink>

          {/* PEMBAYARAN */}
          <NavLink
            to="/pembayaran"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaMoneyBillWave />
            Pembayaran
          </NavLink>

          {/* REKAM MEDIS */}
          <NavLink
            to="/rekam-medis"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaFileMedical />
            Rekam Medis
          </NavLink>

        </div>

      </div>

      {/* BOTTOM */}
      <div>

        {/* PROFILE */}
        <div className="profile-box">

          <img
            src="https://i.pravatar.cc/100"
            alt=""
          />

          <div>
            <h4>Dika</h4>
            <p>Administrator</p>
          </div>

        </div>

        {/* LOGOUT */}
        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          <FaSignOutAlt />

          Logout

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;