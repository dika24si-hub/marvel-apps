import { FaBell, FaSearch, FaEnvelope, FaCog } from "react-icons/fa";
import fotoDika from "../assets/dika.jpg";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLang } from "../i18n/LanguageContext";

export default function Navbar() {
  const { t } = useLang();

  return (
    <header className="navbar">
      <div className="search-box">
        <FaSearch />
        <input type="text" placeholder={t("navbar.search")} />
      </div>

      <div className="navbar-right">
        <LanguageSwitcher />

        <button className="nav-icon" aria-label="Messages">
          <FaEnvelope />
        </button>

        <button className="nav-icon" aria-label="Notifications">
          <FaBell />
        </button>

        <button className="nav-icon" aria-label="Settings">
          <FaCog />
        </button>

        <div className="user-box">
          <img src={fotoDika} alt="Dr Dika" />
          <div>
            <h4>Dr. Dika</h4>
            <p>{t("navbar.role")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
