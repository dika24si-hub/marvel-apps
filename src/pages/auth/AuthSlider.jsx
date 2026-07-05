import { useState, useEffect } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";

import { FaPaw, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  BsExclamationCircleFill,
  BsCheckCircleFill,
} from "react-icons/bs";

import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../router/guards";
import LanguageSwitcher from "../../components/LanguageSwitcher";

import "./auth-slider.css";

export default function AuthSlider() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, register, isAuthenticated, role } = useAuth();

  // rightActive => mode Sign Up (panel bergeser)
  const [rightActive, setRightActive] = useState(
    location.pathname === "/register"
  );

  // ---- Sign In ----
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // ---- Sign Up ----
  const [suName, setSuName] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const target = rightActive ? "/register" : "/login";
    if (location.pathname !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [rightActive, location.pathname]);

  const switchTo = (toRegister) => {
    setError("");
    setSuccess("");
    setRightActive(toRegister);
  };

  if (isAuthenticated && role) {
    return <Navigate to={roleHome(role)} replace />;
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(siEmail.trim(), siPassword);
      if (!result.success) {
        setError(result.error || "Email atau password salah");
        return;
      }
      navigate(roleHome(result.role), { replace: true });
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail.trim());
    if (!emailOk) {
      setError("Format email tidak valid. Gunakan nama@email.com");
      return;
    }
    if (suPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    try {
      setLoading(true);
      const result = await register(suEmail, suPassword, suName, suPhone);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess("Registrasi berhasil. Silakan masuk.");
      setTimeout(() => switchTo(false), 1400);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="as-bg">
      <div className="as-topbar">
        <LanguageSwitcher />
      </div>

      <div className={`as-container ${rightActive ? "right-active" : ""}`}>
        {/* ---------- SIGN UP FORM ---------- */}
        <div className="as-form-box as-sign-up">
          <form onSubmit={handleSignUp}>
            <h1>Buat Akun</h1>

            <div className="as-socials">
              <button type="button" className="as-social" aria-label="Facebook">
                <FaFacebookF />
              </button>
              <button type="button" className="as-social" aria-label="LinkedIn">
                <FaLinkedinIn />
              </button>
              <button type="button" className="as-social" aria-label="X">
                <FaXTwitter />
              </button>
            </div>

            <span className="as-sub">atau gunakan email untuk daftar</span>

            {rightActive && error && (
              <div className="as-alert">
                <BsExclamationCircleFill />
                <span>{error}</span>
              </div>
            )}
            {rightActive && success && (
              <div className="as-alert ok">
                <BsCheckCircleFill />
                <span>{success}</span>
              </div>
            )}

            <input
              className="as-input"
              type="text"
              placeholder="Nama Lengkap"
              value={suName}
              onChange={(e) => setSuName(e.target.value)}
              required
            />
            <input
              className="as-input"
              type="text"
              placeholder="Nomor Telepon"
              value={suPhone}
              onChange={(e) => setSuPhone(e.target.value)}
            />
            <input
              className="as-input"
              type="email"
              placeholder="Email"
              value={suEmail}
              onChange={(e) => setSuEmail(e.target.value)}
              required
            />
            <input
              className="as-input"
              type="password"
              placeholder="Password"
              value={suPassword}
              onChange={(e) => setSuPassword(e.target.value)}
              required
            />

            <button className="as-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
            </button>

            <p className="as-mobile-switch">
              Sudah punya akun?
              <button type="button" onClick={() => switchTo(false)}>
                Masuk
              </button>
            </p>
          </form>
        </div>

        {/* ---------- SIGN IN FORM ---------- */}
        <div className="as-form-box as-sign-in">
          <form onSubmit={handleSignIn}>
            <h1>Masuk ke Website</h1>

            <div className="as-socials">
              <button type="button" className="as-social" aria-label="Facebook">
                <FaFacebookF />
              </button>
              <button type="button" className="as-social" aria-label="LinkedIn">
                <FaLinkedinIn />
              </button>
              <button type="button" className="as-social" aria-label="X">
                <FaXTwitter />
              </button>
            </div>

            <span className="as-sub">atau gunakan akun email Anda</span>

            {!rightActive && error && (
              <div className="as-alert">
                <BsExclamationCircleFill />
                <span>{error}</span>
              </div>
            )}

            <input
              className="as-input"
              type="email"
              placeholder="Email"
              value={siEmail}
              onChange={(e) => setSiEmail(e.target.value)}
              required
            />
            <input
              className="as-input"
              type="password"
              placeholder="Password"
              value={siPassword}
              onChange={(e) => setSiPassword(e.target.value)}
              required
            />

            <button type="button" className="as-forgot">
              Lupa password?
            </button>

            <button className="as-btn" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <p className="as-mobile-switch">
              Belum punya akun?
              <button type="button" onClick={() => switchTo(true)}>
                Daftar
              </button>
            </p>
          </form>
        </div>

        {/* ---------- OVERLAY ---------- */}
        <div className="as-overlay-box">
          <div className="as-overlay">
            {/* Panel kiri — tampil saat mode Sign Up */}
            <div className="as-overlay-panel as-overlay-left">
              <div className="as-overlay-logo">
                <FaPaw />
              </div>
              <h1>Selamat Datang!</h1>
              <p>
                Untuk tetap terhubung dengan kami, silakan masuk dengan data
                pribadi Anda.
              </p>
              <button
                className="as-btn ghost"
                type="button"
                onClick={() => switchTo(false)}
              >
                Masuk
              </button>
            </div>

            {/* Panel kanan — tampil saat mode Sign In */}
            <div className="as-overlay-panel as-overlay-right">
              <div className="as-overlay-logo">
                <FaPaw />
              </div>
              <h1>Halo, Sahabat!</h1>
              <p>
                Masukkan data diri Anda dan mulai perjalanan bersama VetCare.
              </p>
              <button
                className="as-btn ghost"
                type="button"
                onClick={() => switchTo(true)}
              >
                Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
