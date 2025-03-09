import axios from 'axios';

const API_URL = 'http://0.0.0.0:5000/api';

export const categoryService = {
  getCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};