// Application Configuration
// This file centralizes all hardcoded values that should be configurable

export const APP_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: (import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL)) || 'http://localhost:5000',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
  },

  // Currency Configuration
  CURRENCY: {
    CODE: 'LKR',
    SYMBOL: 'LKR',
    LOCALE: 'en-LK',
    DECIMAL_PLACES: 2,
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  },

  // Pagination Configuration
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    MAX_VISIBLE_PAGES: 5,
  },

  // Time Configuration
  TIME: {
    POLLING_INTERVAL: 10000, // 10 seconds
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  },

  // Rating Configuration
  RATING: {
    MAX_STARS: 5,
    MIN_STARS: 1,
  },

  // Task Configuration
  TASK: {
    MIN_PAYMENT: 500,
    MAX_PAYMENT: 50000,
    DEFAULT_PAYMENT_RANGES: [
      { value: 1000, label: 'LKR 1,000' },
      { value: 2000, label: 'LKR 2,000' },
      { value: 3000, label: 'LKR 3,000' },
      { value: 5000, label: 'LKR 5,000' },
      { value: 7500, label: 'LKR 7,500' },
      { value: 10000, label: 'LKR 10,000' },
      { value: 15000, label: 'LKR 15,000' },
      { value: 20000, label: 'LKR 20,000' },
      { value: 25000, label: 'LKR 25,000' },
      { value: 30000, label: 'LKR 30,000' },
    ],
  },

  // UI Configuration
  UI: {
    TOAST_DURATION: 5000, // 5 seconds
    ANIMATION_DURATION: 300, // 300ms
    DEBOUNCE_DELAY: 300, // 300ms
  },

  // Validation Configuration
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    PHONE_REGEX: /^(\+94|0)[1-9][0-9]{8}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Helper functions
export const formatCurrency = (amount, currency = APP_CONFIG.CURRENCY.CODE) => {
  if (!amount) return `${currency} 0`;
  return `${currency} ${Number(amount).toLocaleString(APP_CONFIG.CURRENCY.LOCALE)}`;
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFileSize = (file, maxSize = APP_CONFIG.UPLOAD.MAX_FILE_SIZE) => {
  return file.size <= maxSize;
};

export const validateFileType = (file, allowedTypes = APP_CONFIG.UPLOAD.ALLOWED_IMAGE_TYPES) => {
  return allowedTypes.includes(file.type);
}; 