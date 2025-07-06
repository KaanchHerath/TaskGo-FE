import axios from 'axios';

import { APP_CONFIG } from '../../config/appConfig';

const API_URL = `${APP_CONFIG.API.BASE_URL}/api`;

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