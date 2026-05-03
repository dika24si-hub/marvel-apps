import { FaBell, FaSearch, FaEnvelope, FaCog } from "react-icons/fa";
import fotoDika from "../assets/dika.jpg";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="search-box">
        <FaSearch />
        <input type="text" placeholder="Cari data hewan, dokter, jadwal..." />
      </div>

      <div className="navbar-right">
        <span className="language">Indonesia</span>

        <button className="nav-icon">
          <FaEnvelope />
        </button>

        <button className="nav-icon">
          <FaBell />
        </button>

        <button className="nav-icon">
          <FaCog />
        </button>

        <div className="user-box">
          <img src={fotoDika} alt="Dr Dika" />
          <div>
            <h4>Dr. Dika</h4>
            <p>Dokter Hewan</p>
          </div>
        </div>
      </div>
    </header>
  );
}