// src/services/api.js
/*import axios from 'axios';

export async function predictDiabetes(data) {
  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi gọi API:', error);
    return {
      risk_level: 'Không xác định',
      probability: 'Không rõ'
    };
  }
}
*/

// src/services/api.js
import axios from 'axios';

// Tự động dùng biến môi trường khi hosting, fallback localhost khi dev
const API_BASE_URL = process.env.REACT_APP_API;


export async function predictDiabetes(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi gọi API:', error);
    return {
      risk_level: 'Không xác định',
      probability: 'Không rõ'
    };
  }
}

