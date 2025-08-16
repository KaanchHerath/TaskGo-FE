import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import WaitingApproval from '../WaitingApproval';
import { getApprovalStatus } from '../../../services/api/userService';

// Mock the API service
jest.mock('../../../services/api/userService');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('WaitingApproval Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  describe('Loading State', () => {
    test('shows loading spinner initially', () => {
      getApprovalStatus.mockImplementation(() => new Promise(() => {}));
      
      renderWithRouter(<WaitingApproval />);
      
      expect(screen.getByText('Loading approval status...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
    });
  });

  describe('Pending Approval Status', () => {
    const mockPendingData = {
      approvalStatus: 'pending',
      isApproved: false,
      rejectionReason: null,
      approvedAt: null,
      approvedBy: null,
      additionalInfo: {
        daysSinceRegistration: 2,
        estimatedProcessingTime: '3-5 business days',
        canUpdateProfile: true
      }
    };

    beforeEach(() => {
      getApprovalStatus.mockResolvedValue({ data: mockPendingData });
    });

    test('displays pending approval status correctly', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Pending Approval')).toBeInTheDocument();
        expect(screen.getByText('Your application is under review')).toBeInTheDocument();
      });
    });

    test('shows application progress steps', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Application Progress')).toBeInTheDocument();
        expect(screen.getByText('Application Submitted')).toBeInTheDocument();
        expect(screen.getByText('Under Review')).toBeInTheDocument();
        expect(screen.getByText('Approval Decision')).toBeInTheDocument();
      });
    });

    test('displays estimated processing time', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Estimated Processing Time')).toBeInTheDocument();
        expect(screen.getByText('3-5 business days')).toBeInTheDocument();
        expect(screen.getByText('2 days')).toBeInTheDocument();
      });
    });

    test('shows what user can do while waiting', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('While You Wait')).toBeInTheDocument();
        expect(screen.getByText('Update Your Profile')).toBeInTheDocument();
        expect(screen.getByText('Prepare Documents')).toBeInTheDocument();
        expect(screen.getByText('Review Platform')).toBeInTheDocument();
      });
    });
  });

  describe('Rejected Approval Status', () => {
    const mockRejectedData = {
      approvalStatus: 'rejected',
      isApproved: false,
      rejectionReason: 'Incomplete documentation provided',
      approvedAt: null,
      approvedBy: null,
      additionalInfo: {
        canReapply: true,
        reapplicationInstructions: 'Please update your profile and documents, then contact support to request re-evaluation.'
      }
    };

    beforeEach(() => {
      getApprovalStatus.mockResolvedValue({ data: mockRejectedData });
    });

    test('displays rejected status correctly', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Application Rejected')).toBeInTheDocument();
        expect(screen.getByText('Your application was not approved')).toBeInTheDocument();
      });
    });

    test('shows rejection reason', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Rejection Reason')).toBeInTheDocument();
        expect(screen.getByText('Incomplete documentation provided')).toBeInTheDocument();
      });
    });

    test('displays next steps for rejected application', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Next Steps')).toBeInTheDocument();
        expect(screen.getByText('Update Your Application')).toBeInTheDocument();
        expect(screen.getByText('Contact Support')).toBeInTheDocument();
        expect(screen.getByText('Reapply When Ready')).toBeInTheDocument();
      });
    });
  });

  describe('Approved Status', () => {
    const mockApprovedData = {
      approvalStatus: 'approved',
      isApproved: true,
      rejectionReason: null,
      approvedAt: '2024-01-01T00:00:00.000Z',
      approvedBy: 'admin-id',
      additionalInfo: {
        approvedAt: '2024-01-01T00:00:00.000Z',
        approvedBy: 'Admin',
        canStartWorking: true
      }
    };

    beforeEach(() => {
      getApprovalStatus.mockResolvedValue({ data: mockApprovedData });
    });

    test('displays approved status correctly', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(screen.getByText('Your application has been approved!')).toBeInTheDocument();
      });
    });

    test('shows approval date', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Approved on:')).toBeInTheDocument();
        expect(screen.getByText('1/1/2024')).toBeInTheDocument();
      });
    });

    test('displays get started section', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Get Started')).toBeInTheDocument();
        expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
        expect(screen.getByText('Browse Available Tasks')).toBeInTheDocument();
        expect(screen.getByText('Start Earning')).toBeInTheDocument();
      });
    });

    test('shows go to dashboard button', async () => {
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        const dashboardButton = screen.getByText('Go to Dashboard');
        expect(dashboardButton).toBeInTheDocument();
        
        fireEvent.click(dashboardButton);
        expect(mockNavigate).toHaveBeenCalledWith('/tasker/dashboard');
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error message when API fails', async () => {
      getApprovalStatus.mockRejectedValue(new Error('API Error'));
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Error Loading Status')).toBeInTheDocument();
        expect(screen.getByText('Failed to load approval status. Please try again.')).toBeInTheDocument();
      });
    });

    test('shows try again button on error', async () => {
      getApprovalStatus.mockRejectedValue(new Error('API Error'));
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        const tryAgainButton = screen.getByText('Try Again');
        expect(tryAgainButton).toBeInTheDocument();
        
        fireEvent.click(tryAgainButton);
        expect(getApprovalStatus).toHaveBeenCalledTimes(2);
      });
    });

    test('shows go home button on error', async () => {
      getApprovalStatus.mockRejectedValue(new Error('API Error'));
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        const goHomeButton = screen.getByText('Go Home');
        expect(goHomeButton).toBeInTheDocument();
        
        fireEvent.click(goHomeButton);
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Navigation', () => {
    test('back button navigates to home', async () => {
      getApprovalStatus.mockResolvedValue({ 
        data: { approvalStatus: 'pending', isApproved: false } 
      });
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
        
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Refresh Functionality', () => {
    test('refresh button calls API again', async () => {
      getApprovalStatus.mockResolvedValue({ 
        data: { approvalStatus: 'pending', isApproved: false } 
      });
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        const refreshButton = screen.getByText('Refresh');
        expect(refreshButton).toBeInTheDocument();
        
        fireEvent.click(refreshButton);
        expect(getApprovalStatus).toHaveBeenCalledTimes(2);
      });
    });

    test('refresh button shows loading state', async () => {
      getApprovalStatus.mockResolvedValue({ 
        data: { approvalStatus: 'pending', isApproved: false } 
      });
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        const refreshButton = screen.getByText('Refresh');
        fireEvent.click(refreshButton);
        
        // Button should be disabled during refresh
        expect(refreshButton).toBeDisabled();
      });
    });
  });

  describe('Support Section', () => {
    test('displays support contact information', async () => {
      getApprovalStatus.mockResolvedValue({ 
        data: { approvalStatus: 'pending', isApproved: false } 
      });
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('Need Help?')).toBeInTheDocument();
        expect(screen.getByText('Email Support')).toBeInTheDocument();
        expect(screen.getByText('Phone Support')).toBeInTheDocument();
        expect(screen.getByText('support@taskgo.com')).toBeInTheDocument();
        expect(screen.getByText('+1 (234) 567-890')).toBeInTheDocument();
      });
    });
  });

  describe('No Data Handling', () => {
    test('handles case when no approval data is returned', async () => {
      getApprovalStatus.mockResolvedValue({ data: null });
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('No Approval Data')).toBeInTheDocument();
        expect(screen.getByText('Unable to load your approval status.')).toBeInTheDocument();
      });
    });
  });

  describe('Time Formatting', () => {
    test('formats time ago correctly', async () => {
      const mockData = {
        approvalStatus: 'pending',
        isApproved: false,
        additionalInfo: {
          daysSinceRegistration: 1
        }
      };
      
      getApprovalStatus.mockResolvedValue({ data: mockData });
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('1 day(s) ago')).toBeInTheDocument();
      });
    });
  });

  describe('Estimated Wait Time Calculation', () => {
    test('calculates estimated wait time correctly', async () => {
      const mockData = {
        approvalStatus: 'pending',
        isApproved: false,
        additionalInfo: {
          daysSinceRegistration: 3
        }
      };
      
      getApprovalStatus.mockResolvedValue({ data: mockData });
      
      renderWithRouter(<WaitingApproval />);
      
      await waitFor(() => {
        expect(screen.getByText('3-5 business days')).toBeInTheDocument();
      });
    });
  });
}); 