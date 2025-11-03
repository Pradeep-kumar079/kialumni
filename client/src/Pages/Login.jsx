import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import img from "../Assets/travel-back.jpg";

const Login = () => {
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";


  const [formData, setFormData] = useState({
    usn: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "usn" ? value.toUpperCase() : value,
    }));
  };


  // ✅ Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.usn || !formData.password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // ✅ Correct backend URL
      const res = await axios.post(
        `${BACKEND_URL}/api/user/login`,
        formData
      );

      if (res.data.success) {
        // Save user data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id);
        localStorage.setItem("role", res.data.user.role);

        alert("Login successful!");

        // ✅ Redirect based on role
        const role = res.data.user.role?.toLowerCase();
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        alert(res.data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">3
        <div className="login-image">
          <img src={img} alt="Login Background" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="login-title">Login</h1>

          <div className="input-box">
            <input
              type="text"
              name="usn"
              placeholder="USN"
              value={formData.usn}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-user"></i>
          </div>

          <div className="input-box">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <i className="bx bxs-lock-alt"></i>
          </div>

          <div className="forgot-link">
            <span onClick={() => navigate("/register")} className="link">
              Create new account
            </span>
            <span onClick={() => navigate("/forgot-password")} className="link">
              Forgot password?
            </span>
          </div>

          <button type="submit" className="btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
