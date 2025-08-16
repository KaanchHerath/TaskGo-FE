// Centralized authentication utilities

export const roleToDashboard = {
  customer: '/customer/dashboard',
  tasker: '/tasker/dashboard',
  admin: '/admin/dashboard',
};

export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
  // Notify listeners in this tab
  window.dispatchEvent(new Event('authStateChanged'));
}

// Cached user display name helpers
export const USER_NAME_CACHE_KEY = 'userName';

export function getCachedUserName() {
  return localStorage.getItem(USER_NAME_CACHE_KEY);
}

export function setCachedUserName(name) {
  if (typeof name === 'string' && name.trim()) {
    localStorage.setItem(USER_NAME_CACHE_KEY, name.trim());
    // Notify listeners so UI picking from cache can update
    window.dispatchEvent(new Event('authStateChanged'));
  }
}

export function clearCachedUserName() {
  localStorage.removeItem(USER_NAME_CACHE_KEY);
}

export function clearToken() {
  localStorage.removeItem('token');
  // Also clear cached user name
  clearCachedUserName();
  // Notify listeners in this tab
  window.dispatchEvent(new Event('authStateChanged'));
}


