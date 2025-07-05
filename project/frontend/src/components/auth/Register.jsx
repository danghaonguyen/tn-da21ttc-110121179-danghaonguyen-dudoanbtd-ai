import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { registerUser } from "../../services/auth";
import "./css/Auth.css";
import {toast, ToastContainer} from "react-toastify";

const API_BASE = process.env.REACT_APP_API;  

const Register = () => {
  const [step, setStep] = useState("form");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const handleSendCode = async () => {
    if (!email || !username || !password || !confirmPassword) {
     toast.warning("Vui lòng nhập đầy đủ thông tin");
      return;
    }
 
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.warning("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
     /*await axios.post("http://127.0.0.1:5000/send_verification_code", {
        email: email,
      }, {
        withCredentials: true 
      });*/
      await axios.post(`${API_BASE}/send_verification_code`, {
        email: email,
      }, {
          withCredentials: true
      });
      
      toast.success("✅ Đã gửi mã xác thực đến email");
      setStep("verify");
    } catch (err) {
      toast.error("❌ Không thể gửi mã xác thực");
      console.error(err);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!verificationCode) {
     toast.warning("Vui lòng nhập mã xác thực");
      return;
    }

    try {
      const res = await registerUser({
        username,
        email,
        password,
        code: verificationCode
      });

      toast.success(res.data.message);
      if (res.status === 201) {
         setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Đăng Ký</h2>

        {step === "form" ? (
          <>
            <input type="text" placeholder="Họ tên" className="auth-input"
              value={username} onChange={(e) => setUsername(e.target.value)} />

            <input type="email" placeholder="Email" className="auth-input"
              value={email} onChange={(e) => setEmail(e.target.value)} />

            <div className="input-with-toggle">
              <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu"
                className="auth-input"
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="toggle-button"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "ẨN" : "HIỆN"}
              </button>
            </div>

            <div className="input-with-toggle">
              <input type={showPassword ? "text" : "password"} placeholder="Xác nhận mật khẩu"
                className="auth-input"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button type="button" className="toggle-button"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "ẨN" : "HIỆN"}
              </button>
            </div>

            <button className="auth-button" onClick={handleSendCode}>
              Gửi mã xác thực
            </button>
          </>
        ) : (
          <>
            <input type="text" placeholder="Nhập mã xác thực đã gửi email"
              className="auth-input"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)} />

            <button className="auth-button" onClick={handleVerifyAndRegister}>
              Xác nhận & Đăng ký
            </button>
          </>
        )}

        <p className="auth-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
        <Link to="/" className="back-home">← Quay về Trang chủ</Link>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Register;
