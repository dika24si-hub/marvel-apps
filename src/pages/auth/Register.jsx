import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
  FaPaw,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

import {
  BsExclamationCircleFill,
  BsCheckCircleFill,
} from "react-icons/bs";

import { useLang } from "../../i18n/LanguageContext";
import { useAuth } from "../../context/AuthContext";

import {
  Input,
  Button,
} from "../../components/ui";

export default function Register() {
  const { t } = useLang();
  const navigate = useNavigate();

  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validasi format email (Supabase mewajibkan email valid: nama@domain.com)
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      setError(
        "Format email tidak valid. Gunakan email seperti nama@email.com"
      );
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password tidak sama");
      return;
    }

    try {
      setLoading(true);

      const result = await register(
        email,
        password,
        fullName,
        phone
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess("Registrasi berhasil. Silakan login.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(err.message);
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
        <h1>Buat Akun Baru 🐾</h1>
        <p>
          Daftar sebagai Pemilik Hewan untuk mulai mengelola perawatan
          peliharaan Anda.
        </p>
      </div>

      {error && (
        <div className="ax-alert">
          <BsExclamationCircleFill />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="ax-alert ok">
          <BsCheckCircleFill />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ax-form">
        <Input
          label="Nama Lengkap"
          type="text"
          placeholder="Masukkan nama lengkap"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<FaUser />}
          autoFocus
          required
        />

        <Input
          label="Nomor Telepon"
          type="text"
          placeholder="08xxxxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<FaPhone />}
        />

        <Input
          label="Email"
          type="email"
          placeholder="customer@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<FaEnvelope />}
          required
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Minimal 6 karakter"
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

        <Input
          label="Konfirmasi Password"
          type={showConfirm ? "text" : "password"}
          placeholder="Ulangi password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<FaLock />}
          rightIcon={
            <span
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          }
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={loading}
          className="ax-submit"
        >
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </Button>
      </form>

      <div className="ax-divider">atau</div>

      <p className="ax-alt">
        Sudah memiliki akun?{" "}
        <button
          type="button"
          className="ax-link"
          onClick={() => navigate("/login")}
        >
          Masuk di sini
        </button>
      </p>

      <small className="ax-foot">
        © 2026 VetCare Animal Clinic. All rights reserved.
      </small>
    </>
  );
}
