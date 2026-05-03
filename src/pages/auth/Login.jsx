import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPaw } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { BsFillExclamationDiamondFill } from "react-icons/bs";

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dataForm, setDataForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Sudah login");
    }
  }, []);

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
          setError("Login gagal");
          return;
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));

        navigate("/");
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Terjadi kesalahan saat login"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-logo">
        <FaPaw />
      </div>

      <h2>Login VetCare</h2>
      <p>Masuk sebagai admin klinik dokter hewan</p>

      {error && (
        <div className="error-box">
          <BsFillExclamationDiamondFill /> {error}
        </div>
      )}

      {loading && (
        <div className="loading-box">
          <ImSpinner2 className="spin" /> Mohon tunggu...
        </div>
      )}

      <label>Email</label>
      <input
        type="text"
        name="email"
        placeholder="contoh: emilys"
        onChange={handleChange}
        required
      />

      <label>Password</label>
      <input
        type="password"
        name="password"
        placeholder="contoh: emilys pass"
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Login"}
      </button>

      <p className="text-center text-sm mt-3">
        Belum punya akun?{" "}
        <a href="/register" className="text-green-500">
          Register
        </a>
      </p>

      <p className="text-center text-sm">
        <a href="/forgot" className="text-gray-500">
          Lupa password?
        </a>
      </p>

      <small>© 2025 VetCare Animal Clinic</small>
    </form>
  );
}