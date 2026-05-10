import { Outlet } from "react-router-dom";
import {
  FaPaw,
  FaHeartbeat,
  FaStethoscope,
  FaUserMd,
  FaShieldAlt,
} from "react-icons/fa";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLang } from "../i18n/LanguageContext";

export default function AuthLayout() {
  const { t } = useLang();

  return (
    <div className="auth-layout">
      {/* LEFT – Branding Panel */}
      <div className="auth-branding">
        <div className="auth-brand-top">
          <div className="brand-icon">
            <FaPaw />
          </div>
          <h2>{t("app.name")}</h2>
        </div>

        <div className="auth-brand-body">
          <h1>
            {t("login.brandingTitle")} <span>{t("login.brandingHighlight")}</span>.
          </h1>

          <p>{t("login.brandingSubtitle")}</p>

          <ul className="auth-features">
            <li>
              <span className="feat-icon blue">
                <FaStethoscope />
              </span>
              <div>
                <b>{t("login.feat1Title")}</b>
                <small>{t("login.feat1Sub")}</small>
              </div>
            </li>
            <li>
              <span className="feat-icon teal">
                <FaUserMd />
              </span>
              <div>
                <b>{t("login.feat2Title")}</b>
                <small>{t("login.feat2Sub")}</small>
              </div>
            </li>
            <li>
              <span className="feat-icon orange">
                <FaHeartbeat />
              </span>
              <div>
                <b>{t("login.feat3Title")}</b>
                <small>{t("login.feat3Sub")}</small>
              </div>
            </li>
          </ul>

          <div className="auth-footer-info">
            <FaShieldAlt />
            {t("login.secure")}
          </div>
        </div>

        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      {/* RIGHT – Form */}
      <div className="auth-form-wrap">
        {/* Language switcher di pojok kanan atas */}
        <div className="auth-lang-wrap">
          <LanguageSwitcher />
        </div>

        <div className="auth-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
