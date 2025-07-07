# XÂY DỰNG ỨNG DỤNG PHÂN TÍCH DỮ LIỆU Y TẾ ĐỂ DỰ ĐOÁN  BỆNH TIỂU ĐƯỜNG

## Giới thiệu

Đây là ứng dụng web hỗ trợ người dùng **dự đoán nguy cơ mắc bệnh tiểu đường** dựa trên các chỉ số sức khỏe. Hệ thống kết hợp giữa **giao diện ReactJS** và **backend Python Flask**

### 🧩 Các tính năng chính:

- Trang **Đăng nhập / Đăng ký**
- Trang **Trang chủ** (giới thiệu ứng dụng, hướng dẫn, liên hệ)
- **Trang dự đoán** nguy cơ tiểu đường bằng cách nhập chỉ số y tế
- Hiển thị **kết quả dự đoán** kèm mức độ nguy cơ (thấp, trung bình, cao)
- Biểu đồ **so sánh chỉ số của bạn với chỉ số bình thường**
- Trang **Lịch sử dự đoán**: Xem lại toàn bộ kết quả và thông tin đã nhập

---

## 🚀 Hướng dẫn chạy ứng dụng

git Clone về máy: 

### 1. Backend – Flask API (Python)

cd backend
python app.py


### 2. Frontend – ReactJs

Cd frontend
npm start

### 3. CSDL - MySQL

-> Lấy csdl trong thư mục database:
diabetes_app.sql
