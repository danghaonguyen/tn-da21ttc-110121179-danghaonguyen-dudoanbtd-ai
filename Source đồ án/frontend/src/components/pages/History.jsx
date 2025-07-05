import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import axios from "axios";
import Modal from "react-modal";
import Select from "react-select";
import HeaderTop from "./HeaderTop";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./css/History.css";
import "./css/Footer.css";
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

Modal.setAppElement("#root");

const formatDateTime = (value) => {
  if (!value || typeof value !== "string") return "";
  const [datePart, timePart] = value.split(" ");
  if (!datePart || !timePart) return "";
  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");
  return `${hour}:${minute} ${day}/${month}/${year}`;
};

function History() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const userId = localStorage.getItem("user_id");

  const [filterDate, setFilterDate] = useState(null);
  const [filterMonth, setFilterMonth] = useState(null);
  const [filterYear, setFilterYear] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://127.0.0.1:5000/history/${userId}`)
        .then((res) => setHistory(res.data))
        .catch((err) => console.error("Lỗi khi lấy lịch sử:", err));
    }
  }, [userId]);

    // 🔐 Kiểm tra đăng nhập
  useEffect(() => {
    if (!userId) {
      toast.warning("Bạn cần đăng nhập để sử dụng chức năng này!");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate, userId]);

  const getDaysInMonth = (month, year) => {
    if (!month || !year) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const formatGender = (g) => (g === 1 ? "Nam" : "Nữ");
  const formatNumber = (num) =>
    typeof num !== "number"
      ? num
      : num.toLocaleString("vi-VN", { maximumFractionDigits: 2 });

  const getRiskClass = (level) =>
    level === "Cao"
      ? "risk-high"
      : level === "Trung bình"
      ? "risk-medium"
      : "risk-low";

  const handleRowClick = (item) => setSelected(item);
  const closeModal = () => setSelected(null);

 const handleDelete = (id) => {
  toast.info(
    ({ closeToast }) => (
      <div>
        <div>Bạn có muốn xóa dự đoán này?</div>
        <div style={{ marginTop: 10, display: "flex", gap: "10px" }}>
          <button
            style={{ padding: "5px 10px", background: "#d32f2f", color: "white", border: "none", borderRadius: 4 }}
            onClick={() => {
              axios
                .delete(`http://127.0.0.1:5000/history/${id}`)
                .then(() => {
                  setHistory((prev) => prev.filter((item) => item.id !== id));
                  toast.success("Đã xóa dự đoán thành công!");
                })
                .catch((err) => toast.error("Xóa thất bại: " + err.message));
              closeToast(); // đóng hộp thoại lại sau khi xác nhận
            }}
          >
            Có
          </button>
          <button
            style={{ padding: "5px 10px", background: "#ccc", color: "#333", border: "none", borderRadius: 4 }}
            onClick={closeToast}
          >
            Không
          </button>
        </div>
      </div>
    ),
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
    }
  );
};

  const selectedDay = filterDate?.value || "";
  const selectedMonth = filterMonth?.value || "";
  const selectedYear = filterYear?.value || "";

  const filteredHistory = history.filter((item) => {
    const date = new Date(item.created_at);
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();

    const matchDay = selectedDay ? day === selectedDay : true;
    const matchMonth = selectedMonth ? month === selectedMonth : true;
    const matchYear = selectedYear ? year === selectedYear : true;

    return matchDay && matchMonth && matchYear;
  });

  const currentYear = new Date().getFullYear(); // Luôn cập nhật mỗi năm
  const years = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - 5 + i;
    return {
      value: year.toString(),
      label: year.toString(),
    };
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Tháng ${(i + 1).toString()}`, // Tháng
  }));

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Ngày ${(i + 1).toString()}`, // Ngày
  }));

  return (
    <>
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <HeaderTop />
        <Navbar />
        <main style={{ flex: 1 }}>
          <div className="history-container">
            <h2 style={{ marginBottom: "24px" }}>📋 Lịch sử dự đoán</h2>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "end",
                marginBottom: "20px",
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: "160px" }}>
                <Select
                  placeholder="Chọn ngày"
                  options={days}
                  value={filterDate}
                  onChange={setFilterDate}
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontWeight: "600",
                      fontSize: "16px",
                      borderColor: "#007bff",
                      boxShadow: "none",
                      minHeight: "38px",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontWeight: "500",
                      color: "#555",
                    }),
                  }}
                />
              </div>
              <div style={{ minWidth: "160px" }}>
                <Select
                  placeholder="Chọn tháng"
                  options={months}
                  value={filterMonth}
                  onChange={setFilterMonth}
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontWeight: "600",
                      fontSize: "16px",
                      borderColor: "#007bff",
                      boxShadow: "none",
                      minHeight: "38px",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontWeight: "500",
                      color: "#555",
                    }),
                  }}
                />
              </div>
              <div style={{ minWidth: "160px" }}>
                <Select
                  placeholder="Chọn năm"
                  options={years}
                  value={filterYear}
                  onChange={setFilterYear}
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontWeight: "600",
                      fontSize: "16px",
                      borderColor: "#007bff",
                      boxShadow: "none",
                      minHeight: "38px",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontWeight: "500",
                      color: "#555",
                    }),
                  }}
                />
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="no-data-center">
                Không có lịch sử bản ghi dự đoán nào 🔍
              </div>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>🗓 Ngày</th>
                    <th>Tuổi</th>
                    <th>Giới tính</th>
                    <th>Đường huyết</th>
                    <th>BMI</th>
                    <th>Nhịp tim</th>
                    <th>Nguy cơ</th>
                    <th>Xác suất</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {formatDateTime(item.created_at)}
                      </td>
                      <td style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {item.age}
                      </td>
                      <td style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {formatGender(item.gender)}
                      </td>
                      <td style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {formatNumber(item.glucose)}
                      </td>
                      <td style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {formatNumber(item.bmi)}
                      </td>
                      <td style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {formatNumber(item.pulse_rate)}
                      </td>
                      <td className={getRiskClass(item.prediction_result)}>
                        {item.prediction_result}
                      </td>
                      <td style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {(item.prediction_probability * 100).toFixed(1)}%
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => handleRowClick(item)}
                            style={{
                              backgroundColor: "#007bff",
                              color: "#fff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            📝 Chi tiết
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            style={{
                              backgroundColor: "#e74c3c",
                              color: "#fff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
        <Footer />

        <Modal
          isOpen={!!selected}
          onRequestClose={closeModal}
          contentLabel="Chi tiết dự đoán"
          className="modal"
          overlayClassName="overlay"
        >
          {selected && (
            <div>
              <h3>
                📌 Chi tiết dự đoán lúc {formatDateTime(selected.created_at)}
              </h3>

              <div className="modal-content-grid">
                <div>Tuổi: {selected.age}</div>
                <div>Giới tính: {formatGender(selected.gender)}</div>
                <div>Nhịp tim: {selected.pulse_rate} nhịp/phút</div>
                <div>Huyết áp tâm thu: {selected.systolic_bp} mmHg</div>
                <div>Huyết áp tâm trương: {selected.diastolic_bp} mmHg</div>
                <div>Đường huyết: {selected.glucose} mmol/L</div>
                <div>Chiều cao: {selected.height} m</div>
                <div>Cân nặng: {selected.weight} kg</div>
                <div>BMI: {selected.bmi} kg/m²</div>
                <div>
                  Tiền sử tiểu đường GĐ:{" "}
                  {selected.family_diabetes ? "Có" : "Không"}
                </div>
                <div>
                  Tăng huyết áp: {selected.hypertensive ? "Có" : "Không"}
                </div>
                <div>
                  Tiền sử cao huyết áp GĐ:{" "}
                  {selected.family_hypertension ? "Có" : "Không"}
                </div>
                <div>
                  Bệnh tim mạch:{" "}
                  {selected.cardiovascular_disease ? "Có" : "Không"}
                </div>
                <div>Tiền sử đột quỵ: {selected.stroke ? "Có" : "Không"}</div>
                <div>
                  Kết quả:{" "}
                  <strong className={getRiskClass(selected.prediction_result)}>
                    {selected.prediction_result}
                  </strong>
                </div>
                <div>
                  Xác suất: {(selected.prediction_probability * 100).toFixed(1)}
                  %
                </div>
              </div>

              <h4 className="chart-title">
                📊 Biểu đồ so sánh giữa chỉ số của người dùng với chỉ số bình
                thường
              </h4>
              <div
                style={{ width: "100%", height: "500px", marginTop: "20px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Đường huyết",
                        user: selected.glucose,
                        threshold: 7.0,
                      },
                      { name: "BMI", user: selected.bmi, threshold: 22.5 },
                      {
                        name: "Huyết áp tâm thu",
                        user: selected.systolic_bp,
                        threshold: 120,
                      },
                      {
                        name: "Huyết áp tâm trương",
                        user: selected.diastolic_bp,
                        threshold: 80,
                      },
                      {
                        name: "Nhịp tim",
                        user: selected.pulse_rate,
                        threshold: 75,
                      },
                      { name: "Tuổi", user: selected.age, threshold: 45 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 20 }} />
                    <YAxis domain={[0, 200]} tick={{ fontSize: 20 }} />
                    <Tooltip />
                    <Legend
                      payload={[
                        {
                          value: "Người dùng",
                          type: "square",
                          id: "user",
                          color: "#4285F4", // màu bạn muốn
                        },
                        {
                          value: "Bình thường",
                          type: "square",
                          id: "threshold",
                          color: "#00C49F",
                        },
                      ]}
                    />
                    <Bar
                      dataKey="user"
                      name="Người dùng"
                      fill="#4285F4"
                      label={{ position: "top", fontSize: 20 }}
                      shape={(props) => {
                        const { x, y, width, height, payload } = props;
                        const value = payload.user;
                        const threshold = payload.threshold;
                        let color = "#82ca9d";

                        if (value > threshold * 1.2) color = "#f44336";
                        else if (value > threshold) color = "#ffc107";

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

              <div style={{ textAlign: "right", marginTop: "24px" }}>
                <button className="modal-close-btn" onClick={closeModal}>
                  Đóng
                </button>
              </div>
            </div>
          )}
        </Modal>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </>
  );
}

export default History;
