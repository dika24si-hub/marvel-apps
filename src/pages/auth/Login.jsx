import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaPaw,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import { BsExclamationCircleFill } from "react-icons/bs";
import { useLang } from "../../i18n/LanguageContext";
import { Input, Button } from "../../components/ui";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = localStorage.getItem("isLogin");
  if (isLogin) return <Navigate to="/" replace />;

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // simulasi delay supaya tombol loading kelihatan
    setTimeout(() => {
      if (email === "dika@123" && password === "dika123") {
        localStorage.setItem("isLogin", "true");
        navigate("/");
      } else {
        setError(t("login.errorWrong"));
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="login-pro">
      {/* HEADER kecil di atas card */}
      <div className="login-pro-brand">
        <div className="login-pro-logo">
          <FaPaw />
        </div>
        <div>
          <h2>VetCare</h2>
          <small>Veterinary Clinic Dashboard</small>
        </div>
      </div>

      {/* GREETING */}
      <div className="login-pro-head">
        <h1>Selamat Datang Kembali 👋</h1>
        <p>Masuk untuk mengelola klinik dokter hewan Anda hari ini.</p>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="login-pro-alert">
          <BsExclamationCircleFill />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="login-pro-form">
        <Input
          label="Email atau Username"
          type="text"
          placeholder="contoh: dika@123"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<FaEnvelope />}
          autoFocus
          required
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Masukkan password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<FaLock />}
          rightIcon={
            <span
              role="button"
              tabIndex={0}
              onClick={() => setShowPassword((p) => !p)}
              onKeyDown={(e) => e.key === "Enter" && setShowPassword((p) => !p)}
              style={{ cursor: "pointer", pointerEvents: "auto", color: "#7a857f" }}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          }
          required
        />

        <div className="login-pro-row">
          <label className="login-pro-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Ingat saya</span>
          </label>
          <a href="#forgot" className="login-pro-link">
            Lupa password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={loading}
        >
          {loading ? "Memproses..." : "Masuk ke Dashboard"}
        </Button>
      </form>

      <div className="login-pro-divider">
        <span>atau</span>
      </div>

      <div className="login-pro-demo">
        <FaShieldAlt />
        <div>
          <b>Akun Demo</b>
          <small>
            Email: <code>dika@123</code> &nbsp;·&nbsp; Password:{" "}
            <code>dika123</code>
          </small>
        </div>
      </div>

      <small className="login-pro-foot">
        © 2026 VetCare Animal Clinic. All rights reserved.
      </small>
    </div>
  );
}
