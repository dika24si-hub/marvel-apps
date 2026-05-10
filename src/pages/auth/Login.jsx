import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaPaw, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { BsFillExclamationDiamondFill } from "react-icons/bs";
import { useLang } from "../../i18n/LanguageContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const { t } = useLang();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [dataForm, setDataForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm({
      ...dataForm,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    axios
      .post("https://dummyjson.com/user/login", {
        username: dataForm.email,
        password: dataForm.password,
      })
      .then((res) => {
        if (res.status !== 200) {
          setError(t("login.loginFailed"));
          return;
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));

        navigate(from, { replace: true });
      })
      .catch((err) => {
        setError(err.response?.data?.message || t("login.loginError"));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {/* Mini brand (hanya tampil di mobile) */}
      <div className="mobile-brand">
        <div className="login-logo">
          <FaPaw />
        </div>
        <h3>{t("app.name")}</h3>
      </div>

      <div className="form-head">
        <h2>{t("login.welcome")}</h2>
        <p>{t("login.subtitle")}</p>
      </div>

      {error && (
        <div className="alert error">
          <BsFillExclamationDiamondFill />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="alert info">
          <ImSpinner2 className="spin" />
          <span>{t("login.loadingMsg")}</span>
        </div>
      )}

      <div className="field">
        <label>{t("login.emailLabel")}</label>
        <div className="input-wrap">
          <FaEnvelope className="input-icon" />
          <input
            type="text"
            name="email"
            placeholder={t("login.emailPlaceholder")}
            onChange={handleChange}
            value={dataForm.email}
            required
          />
        </div>
      </div>

      <div className="field">
        <div className="label-row">
          <label>{t("login.passwordLabel")}</label>
          <Link to="/forgot" className="link-muted">
            {t("login.forgot")}
          </Link>
        </div>

        <div className="input-wrap">
          <FaLock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t("login.passwordPlaceholder")}
            onChange={handleChange}
            value={dataForm.password}
            required
          />
          <button
            type="button"
            className="toggle-eye"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <div className="field-inline">
        <label className="checkbox">
          <input type="checkbox" />
          <span>{t("login.remember")}</span>
        </label>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? t("login.submitting") : t("login.submit")}
      </button>

      <div className="divider">
        <span>{t("common.or")}</span>
      </div>

      <p className="register-hint">
        {t("login.noAccount")}{" "}
        <Link to="/register" className="link-primary">
          {t("login.registerHere")}
        </Link>
      </p>

      <small className="copyright">{t("login.copyright")}</small>
    </form>
  );
}
