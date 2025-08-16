import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../App';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock the components to avoid complex rendering
jest.mock('../pages/admin/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>
}));

jest.mock('../pages/customer/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="customer-dashboard">Customer Dashboard</div>
}));

jest.mock('../pages/tasker/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="tasker-dashboard">Tasker Dashboard</div>
}));

jest.mock('../pages/auth/Login', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page">Login Page</div>
}));

jest.mock('../pages/common/Home', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>
}));

jest.mock('../components/layout/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>
}));

// Helper function to create a mock JWT token
const createMockToken = (role) => {
  const payload = {
    role: role,
    id: '123',
    email: 'test@example.com',
    iat: Date.now(),
    exp: Date.now() + 3600000
  };
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

describe('Dashboard Redirect Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects admin users to /admin/dashboard when accessing /dashboard', () => {
    const adminToken = createMockToken('admin');
    localStorageMock.getItem.mockReturnValue(adminToken);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to /dashboard
    window.history.pushState({}, '', '/dashboard');
    
    // The component should render the admin dashboard
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
  });

  test('redirects customer users to /customer/dashboard when accessing /dashboard', () => {
    const customerToken = createMockToken('customer');
    localStorageMock.getItem.mockReturnValue(customerToken);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to /dashboard
    window.history.pushState({}, '', '/dashboard');
    
    // The component should render the customer dashboard
    expect(screen.getByTestId('customer-dashboard')).toBeInTheDocument();
  });

  test('redirects tasker users to /tasker/dashboard when accessing /dashboard', () => {
    const taskerToken = createMockToken('tasker');
    localStorageMock.getItem.mockReturnValue(taskerToken);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to /dashboard
    window.history.pushState({}, '', '/dashboard');
    
    // The component should render the tasker dashboard
    expect(screen.getByTestId('tasker-dashboard')).toBeInTheDocument();
  });

  test('redirects to login when no token is present', () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to /dashboard
    window.history.pushState({}, '', '/dashboard');
    
    // The component should render the login page
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('redirects to home when token has invalid role', () => {
    const invalidToken = createMockToken('invalid-role');
    localStorageMock.getItem.mockReturnValue(invalidToken);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to /dashboard
    window.history.pushState({}, '', '/dashboard');
    
    // The component should render the home page
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
}); 