import React, { useState } from "react";
import axios from "axios";
import "./Register.css";
import API from "../api"
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otpVerified, setOtpVerified] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    username: "",
    password: "",
    branch: "",
    admissionyear: "",
    lateralEntry: false,
    role: "student",
    usn: "",
    mobileno: "",
    dob: "",
    termsAccepted: false,
  });

  const [calculatedRole, setCalculatedRole] = useState("student");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    if (name === "admissionyear") newValue = newValue.replace(/\D/, "");
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (name === "admissionyear" || name === "lateralEntry") {
      const currentYear = new Date().getFullYear();
      const admissionYear = name === "admissionyear" ? parseInt(newValue) : parseInt(formData.admissionyear);
      const lateral = name === "lateralEntry" ? checked : formData.lateralEntry;
      if (!isNaN(admissionYear)) {
        const courseDuration = lateral ? 3 : 4;
        const role = admissionYear + courseDuration <= currentYear ? "alumni" : "student";
        setCalculatedRole(role);
        setFormData((prev) => ({ ...prev, role }));
      }
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) return alert("Please enter an email first.");
    try {
      const res = await API.post(`/user/send-otp`, { email: formData.email });

      if (res.data.success) {
        alert("✅ OTP sent successfully to your email!");
      } else {
        alert(res.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error("❌ Send OTP Error:", err.response?.data || err.message);
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await API.post(`/user/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
      });
      if (res.data.success) {
        alert("OTP verified successfully!");
        setOtpVerified(true);
        setStep(2);
      } else alert(res.data.message || "Invalid OTP.");
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) return alert("You must agree to terms before registering.");
    if (!formData.admissionyear || isNaN(parseInt(formData.admissionyear))) return alert("Enter a valid admission year.");

    try {
      const finalData = { ...formData, admissionyear: parseInt(formData.admissionyear) };
      const res = await API.post(`/user/register`, finalData);
      if (res.data.success) {
        alert(`Registration successful as ${formData.role.toUpperCase()}!`);
        navigate("/login");
      } else alert(res.data.message || "Registration failed.");
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={`register-page step-${step}`}>
      <div className="form-inner">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className={`progress-step ${step >= 3 ? "active" : ""}`}>3</div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="step1">
            <h3>Step 1: Verify Your Email</h3>
            <div className="form-group">
              <label>Email</label>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
                <button type="button" className="btn primarys" onClick={handleSendOtp}>
                  Send OTP
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                required
              />
            </div>
            <div className="actions">
              <button type="button" className="btn success" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
              <h3>OR</h3>
              <button className="btn success">
                <Link to={"/login"}>Login</Link>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="step2">
            <h3>Step 2: Basic Details</h3>
            <div className="grid">
              <div className="form-group">
                <label>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <select name="branch" value={formData.branch} onChange={handleChange} required>
                  <option value="">Select Branch</option>
                  <option value="CSE">CSE</option>
                  <option value="ISE">ISE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="TELCOM">TELCOM</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="AI & ML">AI & ML</option>
                </select>
              </div>
              <div className="form-group">
                <label>Admission Year</label>
                <input
                  type="text"
                  name="admissionyear"
                  value={formData.admissionyear}
                  onChange={handleChange}
                  placeholder="Enter year"
                  required
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="lateralEntry" checked={formData.lateralEntry} onChange={handleChange} />
                  Lateral Entry
                </label>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                </select>
                <small>Default calculated role: {calculatedRole.toUpperCase()}</small>
              </div>
            </div>
            <div className="actions">
              <div className="two-reg-btns">
                <button type="button" className="btn secondary" id="reg-btns" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" className="btn primary" id="reg-btns" onClick={() => setStep(3)}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="step3">
            <h3>Step 3: Personal Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid">
                <div className="form-group">
                  <label>USN</label>
                  <input
                    type="text"
                    name="usn"
                    value={formData.usn.toUpperCase()}
                    onChange={handleChange}
                    placeholder="USN"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile No</label>
                  <input type="text" name="mobileno" value={formData.mobileno} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>DOB</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                    />
                    I agree to the terms and conditions
                  </label>
                </div>
              </div>
              <div className="actions">
                <button type="button" className="btn secondary" id="reg-btns" onClick={() => setStep(2)}>
                  Back
                </button>
                <button type="submit" className="btn primary" id="reg-btns">
                  Register
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
