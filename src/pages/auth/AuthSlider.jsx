import { useState, useEffect } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";

import { FaPaw, FaFacebookF, FaLinkedinIn, FaEye, FaEyeSlash } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { supabase } from "../../lib/supabase";
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
  const [showSiPassword, setShowSiPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem("vc_remember_me") === "true";
    } catch {
      return true;
    }
  });

  // ---- Sign Up ----
  const [suName, setSuName] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [showSuPassword, setShowSuPassword] = useState(false);

  // ---- Lupa Password ----
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: "", text: "" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Load saved email if rememberMe is true
  useEffect(() => {
    if (rememberMe) {
      try {
        const savedEmail = localStorage.getItem("vc_saved_email");
        if (savedEmail) setSiEmail(savedEmail);
      } catch (e) {
        console.error(e);
      }
    }
  }, [rememberMe]);

  const handleSocialClick = (platform) => {
    setError(`Login lewat ${platform} belum diaktifkan oleh administrator.`);
    setTimeout(() => setError(""), 3500);
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "transparent" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[a-zA-Z]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score, label: "Lemah 🔴", color: "#ef4444" };
    if (score <= 3) return { score, label: "Sedang 🟡", color: "#f59e0b" };
    return { score, label: "Kuat 🟢", color: "#10b981" };
  };

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

      if (rememberMe) {
        localStorage.setItem("vc_remember_me", "true");
        localStorage.setItem("vc_saved_email", siEmail.trim());
      } else {
        localStorage.setItem("vc_remember_me", "false");
        localStorage.removeItem("vc_saved_email");
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
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: "", text: "" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotMsg({ type: "err", text: "Format email tidak valid." });
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: window.location.origin + "/login",
      });
      if (error) throw error;
      setForgotMsg({ type: "ok", text: "Instruksi reset password telah dikirim ke email Anda." });
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotEmail("");
        setForgotMsg({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      console.error(err);
      setForgotMsg({ type: "err", text: err.message || "Gagal memproses lupa password." });
    } finally {
      setForgotLoading(false);
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
              <button type="button" className="as-social" aria-label="Facebook" onClick={() => handleSocialClick("Facebook")}>
                <FaFacebookF />
              </button>
              <button type="button" className="as-social" aria-label="LinkedIn" onClick={() => handleSocialClick("LinkedIn")}>
                <FaLinkedinIn />
              </button>
              <button type="button" className="as-social" aria-label="X" onClick={() => handleSocialClick("X (Twitter)")}>
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
            <div style={{ position: "relative", width: "100%" }}>
              <input
                className="as-input"
                type={showSuPassword ? "text" : "password"}
                placeholder="Password"
                value={suPassword}
                onChange={(e) => setSuPassword(e.target.value)}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowSuPassword(!showSuPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showSuPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {suPassword && (
              <div style={{ alignSelf: "flex-start", width: "100%", margin: "-8px 0 8px 0", paddingLeft: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                  <span>Kekuatan Kata Sandi:</span>
                  <span style={{ fontWeight: "700", color: getPasswordStrength(suPassword).color }}>{getPasswordStrength(suPassword).label}</span>
                </div>
                <div style={{ height: "4px", width: "100%", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(getPasswordStrength(suPassword).score / 4) * 100}%`,
                    background: getPasswordStrength(suPassword).color,
                    transition: "width 0.2s, background-color 0.2s"
                  }} />
                </div>
              </div>
            )}

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
              <button type="button" className="as-social" aria-label="Facebook" onClick={() => handleSocialClick("Facebook")}>
                <FaFacebookF />
              </button>
              <button type="button" className="as-social" aria-label="LinkedIn" onClick={() => handleSocialClick("LinkedIn")}>
                <FaLinkedinIn />
              </button>
              <button type="button" className="as-social" aria-label="X" onClick={() => handleSocialClick("X (Twitter)")}>
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
            <div style={{ position: "relative", width: "100%" }}>
              <input
                className="as-input"
                type={showSiPassword ? "text" : "password"}
                placeholder="Password"
                value={siPassword}
                onChange={(e) => setSiPassword(e.target.value)}
                required
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowSiPassword(!showSiPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showSiPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              gap: "8px",
              margin: "-6px 0 10px 10px",
              cursor: "pointer",
              userSelect: "none",
              fontSize: "13px",
              color: "#64748b"
            }} onClick={() => setRememberMe(!rememberMe)}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => {}}
                style={{ cursor: "pointer", accentColor: "#34a853" }}
              />
              <span>Ingat Saya</span>
            </div>

            <button type="button" className="as-forgot" onClick={() => setShowForgotModal(true)}>
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

      {showForgotModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: "16px"
        }}>
          <div style={{
            background: "#fff", padding: "28px 24px", borderRadius: "16px",
            width: "100%", maxWidth: "420px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            position: "relative"
          }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", color: "#20322a", fontWeight: "700" }}>Lupa Password?</h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b", lineHeight: 1.4 }}>
              Masukkan alamat email Anda untuk menerima tautan instruksi pengaturan ulang kata sandi.
            </p>
            <form onSubmit={handleForgotSubmit}>
              <input
                type="email"
                placeholder="nama@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "11px 14px", border: "1px solid #d9e2d9",
                  borderRadius: "10px", fontSize: "14px", marginBottom: "14px",
                  fontFamily: "inherit", outline: "none"
                }}
              />
              {forgotMsg.text && (
                <div style={{
                  fontSize: "13px", fontWeight: "600",
                  color: forgotMsg.type === "ok" ? "#10b981" : "#ef4444",
                  marginBottom: "14px"
                }}>
                  {forgotMsg.text}
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail("");
                    setForgotMsg({ type: "", text: "" });
                  }}
                  disabled={forgotLoading}
                  style={{
                    background: "#f1f5f9", color: "#475569", border: "none",
                    borderRadius: "8px", padding: "8px 16px", fontSize: "13px",
                    fontWeight: "600", cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    background: "#34a853", color: "#fff", border: "none",
                    borderRadius: "8px", padding: "8px 16px", fontSize: "13px",
                    fontWeight: "600", cursor: "pointer", transition: "opacity 0.2s"
                  }}
                >
                  {forgotLoading ? "Mengirim..." : "Kirim Instruksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
