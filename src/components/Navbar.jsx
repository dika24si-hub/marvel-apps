import {
  FaSearch,
  FaBell,
  FaEnvelope,
  FaCalendarAlt,
  FaChevronDown,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLang } from "../i18n/LanguageContext";
import { useSearch } from "../context/SearchContext";

export default function Navbar() {
  const { t } = useLang();
  const { keyword, setKeyword, placeholder, enabled, reset } = useSearch();

  return (
    <header className="navbar">
      <div className={`search-box ${enabled ? "" : "disabled"}`}>
        <FaSearch className="s-icon" />
        <input
          type="text"
          placeholder={enabled ? placeholder || t("navbar.search") : t("navbar.search")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          disabled={!enabled}
        />
        {keyword && enabled ? (
          <button
            type="button"
            className="search-clear"
            onClick={reset}
            aria-label="Clear"
          >
            <FaTimes />
          </button>
        ) : (
          <span className="kbd">Ctrl+F</span>
        )}
      </div>

      <div className="navbar-right">
        <LanguageSwitcher />

        <button className="date-pill" type="button">
          <FaCalendarAlt className="dot" />
          <span className="d-text">{t("navbar.dateRange")}</span>
          <span className="kbd-light">{t("navbar.dateShort")}</span>
          <FaChevronDown className="caret" />
        </button>

        <button className="export-btn" type="button">
          <FaArrowRight />
          {t("navbar.export")}
        </button>

        <button className="nav-icon" aria-label="Messages">
          <FaEnvelope />
        </button>

        <button className="nav-icon" aria-label="Notifications">
          <FaBell />
        </button>
      </div>
    </header>
  );
}
