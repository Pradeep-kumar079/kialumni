import React, { useState } from "react";
import axios from "axios";
import "./ForgotPass.css";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

 const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // ✅ Use correct backend URL
      const res = await axios.post(
        `${BACKEND_URL}/api/auth/forgot-password`,
        { email }
      );

      setMsg(res.data.message || "Reset link sent to your email!");
    } catch (err) {
      console.error("Forgot password error:", err);
      setMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p>Enter your registered email to receive a reset link.</p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {msg && <p className="message">{msg}</p>}
      </form>
    </div>
  );
};

export default ForgotPass;
