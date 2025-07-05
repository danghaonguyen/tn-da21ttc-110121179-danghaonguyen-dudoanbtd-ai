// src/services/api.js
import axios from 'axios';

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
