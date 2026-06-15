import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
  FaPaw,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

import { BsExclamationCircleFill } from "react-icons/bs";

import { useLang } from "../../i18n/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../router/guards";

import {
  Input,
  Button,
} from "../../components/ui";

export default function Login() {
  const navigate = useNavigate();

  const { t } = useLang();

  const {
    login,
    isAuthenticated,
    role,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================
  // JIKA SUDAH LOGIN
  // ==========================
  // Hanya redirect bila sudah login DAN role sudah diketahui.
  if (isAuthenticated && role) {
    return (
      <Navigate
        to={roleHome(role)}
        replace
      />
    );
  }

  // ==========================
  // LOGIN
  // ==========================
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login(
        email.trim(),
        password
      );

      if (!result.success) {
        setError(
          result.error ||
          t("login.errorWrong")
        );
        return;
      }

      navigate(roleHome(result.role), {
        replace: true,
      });

    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ax-form-brand">
        <div className="ax-form-logo">
          <FaPaw />
        </div>
        <div>
          <b>VetCare</b>
          <small>Veterinary Clinic Management</small>
        </div>
      </div>

      <div className="ax-head">
        <h1>Selamat Datang Kembali 👋</h1>
        <p>Masuk untuk mengelola klinik dokter hewan Anda.</p>
      </div>

      {error && (
        <div className="ax-alert">
          <BsExclamationCircleFill />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="ax-form">
        <Input
          label="Email"
          type="email"
          placeholder="admin@vetcare.com"
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
              style={{ cursor: "pointer", pointerEvents: "auto" }}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          }
          required
        />

        <div className="ax-row">
          <label className="ax-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Ingat saya</span>
          </label>

          <button type="button" className="ax-link">
            Lupa password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={loading}
          className="ax-submit"
        >
          {loading ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <div className="ax-divider">atau</div>

      <p className="ax-alt">
        Belum memiliki akun?{" "}
        <button
          type="button"
          className="ax-link"
          onClick={() => navigate("/register")}
        >
          Daftar sebagai Pemilik Hewan
        </button>
      </p>

      <small className="ax-foot">
        © 2026 VetCare Animal Clinic. All rights reserved.
      </small>
    </>
  );
}
