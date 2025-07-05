import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  loginUser,
  sendPasswordResetEmail,
  verifyResetCode,
  resetPassword,
} from "../../services/auth";
import "./css/Auth.css";
import { toast, ToastContainer } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // forgotStep có các giá trị: null (login), "email", "verify", "reset"
  const [forgotStep, setForgotStep] = useState(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email, password });
      if (res.status === 200) {
        toast.success(res.data.message);
        localStorage.setItem("user_id", res.data.user_id);
        localStorage.setItem("username", res.data.username);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const handleSendResetEmail = async () => {
    if (!resetEmail) {
      toast.warning("Vui lòng nhập email");
      return;
    }
    try {
      await sendPasswordResetEmail({ email: resetEmail });
      toast.success("Mã xác thực đã gửi tới email của bạn");
      setForgotStep("verify");
    } catch (err) {
      alert(err.response?.data?.message || "Gửi mã thất bại");
    }
  };

  const handleVerifyResetCode = async () => {
    if (!resetCode) {
      toast.warning("Vui lòng nhập mã xác thực");
      return;
    }
    try {
      await verifyResetCode({ email: resetEmail, code: resetCode });
      toast.success("Xác thực thành công, vui lòng nhập mật khẩu mới");
      setTimeout(() => {
        setForgotStep("reset");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã xác thực không đúng");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      toast.warning("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      await resetPassword({
        email: resetEmail,
        code: resetCode,
        new_password: newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      // ⏱ Delay 1.2 giây để toast hiển thị rồi mới reset form
      setTimeout(() => {
        setForgotStep(null);
        setResetEmail("");
        setResetCode("");
        setNewPassword("");
        setConfirmNewPassword("");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {forgotStep === null && (
          <>
            <h2 className="auth-title">Đăng Nhập</h2>
            <input
              type="email"
              placeholder="Email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="input-with-toggle">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="toggle-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "ẨN" : "HIỆN"}
              </button>
            </div>
            <button className="auth-button" onClick={handleLogin}>
              Đăng Nhập
            </button>
            <p
              style={{ cursor: "pointer", color: "#007bff", marginTop: 10 }}
              onClick={() => setForgotStep("email")}
            >
              Quên mật khẩu?
            </p>

            <p className="auth-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
            <Link to="/" className="back-home">
              ← Quay về Trang chủ
            </Link>
          </>
        )}

        {forgotStep === "email" && (
          <>
            <h2 className="auth-title">Đặt Lại Mật Khẩu</h2>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="auth-input"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <button className="auth-button" onClick={handleSendResetEmail}>
              Gửi mã xác thực
            </button>
            <p
              style={{ cursor: "pointer", color: "#007bff", marginTop: 10 }}
              onClick={() => setForgotStep(null)}
            >
              ← Quay lại đăng nhập
            </p>
          </>
        )}

        {forgotStep === "verify" && (
          <>
            <h2 className="auth-title">Xác Thực Mã</h2>
            <input
              type="text"
              placeholder="Nhập mã xác thực"
              className="auth-input"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
            />
            <button className="auth-button" onClick={handleVerifyResetCode}>
              Xác thực
            </button>
            <p
              style={{ cursor: "pointer", color: "#007bff", marginTop: 10 }}
              onClick={() => setForgotStep("email")}
            >
              ← Quay lại nhập email
            </p>
          </>
        )}

        {forgotStep === "reset" && (
          <>
            <h2 className="auth-title">Đổi Mật Khẩu Mới</h2>
            <div className="input-with-toggle">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu mới"
                className="auth-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới"
              className="auth-input"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <button className="auth-button" onClick={handleResetPassword}>
              Đổi mật khẩu
            </button>
            <p
              style={{ cursor: "pointer", color: "#007bff", marginTop: 10 }}
              onClick={() => setForgotStep("email")}
            >
              ← Quay lại nhập email
            </p>
          </>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Login;
