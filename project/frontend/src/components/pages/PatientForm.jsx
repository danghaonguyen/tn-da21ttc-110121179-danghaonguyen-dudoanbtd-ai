import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { predictDiabetes } from "../../services/api";
import Navbar from "./Navbar";
import HeaderTop from "./HeaderTop";
import Footer from "./Footer";
import "./css/PatientForm.css";
import "./css/Navbar.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function PatientForm() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    pulse_rate: "",
    systolic_bp: "",
    diastolic_bp: "",
    glucose: "",
    height: "",
    weight: "",
    bmi: "",
    family_diabetes: "",
    hypertensive: "",
    family_hypertension: "",
    cardiovascular_disease: "",
    stroke: "",
  });

  const [result, setResult] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.warning("Bạn cần đăng nhập để sử dụng chức năng này!");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  const labels = {
    age: "Tuổi",
    gender: "Giới tính",
    pulse_rate: "Nhịp tim (nhịp/phút - bpm)",
    systolic_bp: "Huyết áp tâm thu (mmHg)",
    diastolic_bp: "Huyết áp tâm trương (mmHg)",
    glucose: "Chỉ số đường huyết (mmol/L)",
    height: "Chiều cao (m)",
    weight: "Cân nặng (kg)",
    bmi: "Chỉ số BMI (kg/m²)",
    family_diabetes: "Tiền sử gia đình",
    hypertensive: "Tăng huyết áp",
    family_hypertension: "Tiền sử huyết áp cao trong gia đình",
    cardiovascular_disease: "Bệnh tim mạch",
    stroke: "Tiền sử đột quỵ",
  };

  const placeholders = {
    age: "Nhập tuổi",
    gender: "",
    pulse_rate: "Nhập nhịp tim",
    systolic_bp: "Nhập huyết áp tâm thu",
    diastolic_bp: "Nhập huyết áp tâm trương",
    glucose: "Nhập chỉ số đường huyết",
    height: "Nhập chiều cao (m)",
    weight: "Nhập cân nặng (kg)",
    bmi: "",
    family_diabetes: "",
    hypertensive: "",
    family_hypertension: "",
    cardiovascular_disease: "",
    stroke: "",
  };

  const booleanFields = [
    "family_diabetes",
    "hypertensive",
    "family_hypertension",
    "cardiovascular_disease",
    "stroke",
  ];

  const handleReset = () => {
    setFormData({
      age: "",
      gender: "",
      pulse_rate: "",
      systolic_bp: "",
      diastolic_bp: "",
      glucose: "",
      height: "",
      weight: "",
      bmi: "",
      family_diabetes: "",
      hypertensive: "",
      family_hypertension: "",
      cardiovascular_disease: "",
      stroke: "",
    });
    setResult(null);
    setShowChart(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    if (name === "height" || name === "weight") {
      const height = parseFloat(updatedFormData.height.replace(",", "."));
      const weight = parseFloat(updatedFormData.weight.replace(",", "."));
      if (!isNaN(height) && !isNaN(weight) && height > 0) {
        const bmi = weight / (height * height);
        updatedFormData.bmi = bmi.toFixed(2).replace(".", ",");
      } else {
        updatedFormData.bmi = "";
      }
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowChart(false);

    const numericData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        parseFloat(value?.replace(",", ".")),
      ])
    );

    const userId = localStorage.getItem("user_id");
    const response = await predictDiabetes({
      ...numericData,
      user_id: parseInt(userId),
    });
    setResult(response);
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <HeaderTop />
      <Navbar />
      <div className="patient-form-container">
        <h2 className="form-title">🩺 DỰ ĐOÁN NGUY CƠ BỆNH TIỂU ĐƯỜNG</h2>
        <p className="form-subtitle">
          Nhập các chỉ số theo yêu cầu để bắt đầu dự đoán
        </p>
        <form onSubmit={handleSubmit} className="form-grid">
          {Object.keys(formData).map((key) => (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{labels[key]}</label>

              {key === "gender" ? (
                <select
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="1">Nam</option>
                  <option value="0">Nữ</option>
                </select>
              ) : booleanFields.includes(key) ? (
                <select
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">-- Chọn --</option>
                  <option value="0">Không</option>
                  <option value="1">Có</option>
                </select>
              ) : (
                <input
                  type="text"
                  name={key}
                  id={key}
                  value={formData[key]}
                  autoComplete="off"
                  onChange={handleChange}
                  readOnly={key === "bmi"}
                  className={`form-input ${
                    key === "bmi" ? "readonly-field" : ""
                  } ${key === "bmi" && formData.bmi ? "filled-bmi" : ""}`}
                  placeholder={placeholders[key]}
                  required
                />
              )}
            </div>
          ))}
          {/* <div className="form-actions">
            <button type="submit" className="submit-button">
              🔍 Dự đoán
            </button>
          </div> */}
          <div className="form-actions">
            <button type="submit" className="submit-button">
              🔍 Dự đoán
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="reset-button"
            >
              ✨ Nhập lại
            </button>
          </div>
        </form>

        {result && (
          <div className="result-box">
            <h4>🎯 Kết quả dự đoán</h4>
            <p>{result.result}</p>

            {!showChart && (
              <button
                onClick={() => setShowChart(!showChart)}
                className="compare-chart-button"
              >
                📊 {showChart ? "Ẩn biểu đồ so sánh" : "Xem biểu đồ so sánh"}
              </button>
            )}

            {showChart && (
              <div className="chart-box" style={{ marginTop: "24px" }}>
                <h5>
                  📈 Biểu đồ so sánh giữa chỉ số của người dùng và chỉ số bình
                  thường
                </h5>
                <ResponsiveContainer width="100%" height={700}>
                  <BarChart
                    data={[
                      {
                        name: "Đường huyết",
                        user: parseFloat(formData.glucose.replace(",", ".")),
                        threshold: 7.0,
                      },
                      {
                        name: "BMI",
                        user: parseFloat(formData.bmi.replace(",", ".")),
                        threshold: 22.5,
                      },
                      {
                        name: "Huyết áp tâm thu",
                        user: parseFloat(
                          formData.systolic_bp.replace(",", ".")
                        ),
                        threshold: 120,
                      },
                      {
                        name: "Huyết áp tâm trương",
                        user: parseFloat(
                          formData.diastolic_bp.replace(",", ".")
                        ),
                        threshold: 80,
                      },
                      {
                        name: "Nhịp tim",
                        user: parseFloat(formData.pulse_rate.replace(",", ".")),
                        threshold: 75,
                      },
                      {
                        name: "Tuổi",
                        user: parseFloat(formData.age.replace(",", ".")),
                        threshold: 45,
                      },
                      /* {
                        name: "Tiền sử GĐ",
                        user: parseFloat(formData.family_diabetes),
                        threshold: 0,
                      }, */
                    ]}
                    margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 20 }} />
                    <YAxis domain={[0, 200]} tick={{ fontSize: 20 }} />
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend />
                    <Bar
                      dataKey="user"
                      name="Người dùng"
                      fill="#4285F4"
                      label={{ position: "top", fontSize: 20 }}
                      shape={(props) => {
                        const { x, y, width, height, payload } = props;
                        const value = payload.user;
                        const threshold = payload.threshold;
                        let color = "#82ca9d"; // Tốt
                        if (payload.name === "Tiền sử GĐ") {
                          color = value >= 1 ? "#f44336" : "#82ca9d";
                        } else if (value > threshold * 1.2) {
                          color = "#f44336";
                        } else if (value > threshold) {
                          color = "#ffc658";
                        }
                        return (
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={color}
                            rx={0}
                          />
                        );
                      }}
                    />
                    <Bar
                      dataKey="threshold"
                      name="Bình thường"
                      fill="#00C49F"
                      label={{ position: "top", fontSize: 20 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default PatientForm;
