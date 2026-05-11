import { useState } from "react";

import {
  useNavigate,
  Navigate,
} from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const Login = () => {

  const navigate = useNavigate();

  const isLogin =
    localStorage.getItem("isLogin");

  if(isLogin){
    return <Navigate to="/" />;
  }

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleLogin = (e) => {

    e.preventDefault();

    if(
      email === "dika@123" &&
      password === "dika123"
    ){

      localStorage.setItem(
        "isLogin",
        "true"
      );

      navigate("/");
    }

    else{
      setError(
        "Email atau password salah"
      );
    }
  };

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>VetCare</h1>

        <p>
          Login to dashboard
        </p>

        <form onSubmit={handleLogin}>

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e)=>
              setEmail(e.target.value)
            }
          />

          <div className="password-input">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="Password"

              value={password}

              onChange={(e)=>
                setPassword(e.target.value)
              }
            />

            <button
              type="button"
              className="eye-btn"
              onClick={()=>
                setShowPassword(
                  !showPassword
                )
              }
            >

              {
                showPassword
                  ? <FaEyeSlash />
                  : <FaEye />
              }

            </button>

          </div>

          {
            error && (
              <p className="error-text">
                {error}
              </p>
            )
          }

          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
};

export default Login;