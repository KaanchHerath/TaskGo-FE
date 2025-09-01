import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserManagement from '../UserManagement';
import UserDetails from '../UserDetails';
import UserActionModal from '../UserActionModal';

// Mock the admin service
jest.mock('../../../services/api/adminService', () => ({
  getUsers: jest.fn(),
  getUserDetails: jest.fn(),
  suspendUser: jest.fn(),
  deleteUser: jest.fn(),
}));

// Mock data
const mockUser = {
  _id: '1',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'customer',
  isSuspended: false,
  isApproved: true,
  province: 'Western Province',
  district: 'Colombo',
  createdAt: '2024-01-01T00:00:00.000Z',
  lastActive: '2024-01-15T00:00:00.000Z',
  taskerProfile: {
    experience: '3-5 years',
    skills: ['cleaning', 'gardening'],
    hourlyRate: 25,
    bio: 'Experienced tasker',
    isAvailable: true,
    idDocument: 'https://example.com/id.pdf',
    qualificationDocuments: ['https://example.com/qual1.pdf']
  }
};

const mockUsersResponse = {
  users: [mockUser],
  total: 1,
  page: 1,
  limit: 15
};

describe('User Management Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserManagement', () => {
    it('renders loading state initially', () => {
      render(<UserManagement />);
      expect(screen.getByText(/user management/i)).toBeInTheDocument();
    });

    it('displays users list when data is loaded', async () => {
      const { getUsers } = require('../../../services/api/adminService');
      getUsers.mockResolvedValue(mockUsersResponse);

      render(<UserManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('handles search functionality', async () => {
      const { getUsers } = require('../../../services/api/adminService');
      getUsers.mockResolvedValue(mockUsersResponse);

      render(<UserManagement />);
      
      const searchInput = screen.getByPlaceholderText(/search users/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(getUsers).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'John' })
        );
      });
    });

    it('displays user status badges correctly', async () => {
      const { getUsers } = require('../../../services/api/adminService');
      getUsers.mockResolvedValue(mockUsersResponse);

      render(<UserManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Customer')).toBeInTheDocument();
      });
    });

    it('handles role filtering', async () => {
      const { getUsers } = require('../../../services/api/adminService');
      getUsers.mockResolvedValue(mockUsersResponse);

      render(<UserManagement />);
      
      const roleSelect = screen.getByDisplayValue('All Roles');
      fireEvent.change(roleSelect, { target: { value: 'customer' } });

      await waitFor(() => {
        expect(getUsers).toHaveBeenCalledWith(
          expect.objectContaining({ role: 'customer' })
        );
      });
    });
  });

  describe('UserDetails', () => {
    it('renders user information correctly', () => {
      const onClose = jest.fn();
      const onSuspend = jest.fn();
      const onDelete = jest.fn();

      render(
        <UserDetails
          user={mockUser}
          onClose={onClose}
          onSuspend={onSuspend}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('Western Province, Colombo')).toBeInTheDocument();
    });

    it('displays activity statistics', () => {
      const onClose = jest.fn();
      const onSuspend = jest.fn();
      const onDelete = jest.fn();

      render(
        <UserDetails
          user={mockUser}
          onClose={onClose}
          onSuspend={onSuspend}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText('Activity Statistics')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('displays tasker profile for tasker users', () => {
      const taskerUser = { ...mockUser, role: 'tasker' };
      const onClose = jest.fn();
      const onSuspend = jest.fn();
      const onDelete = jest.fn();

      render(
        <UserDetails
          user={taskerUser}
          onClose={onClose}
          onSuspend={onSuspend}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText('Tasker Profile')).toBeInTheDocument();
      expect(screen.getByText('3-5 years')).toBeInTheDocument();
      expect(screen.getByText('$25')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      const onSuspend = jest.fn();
      const onDelete = jest.fn();

      render(
        <UserDetails
          user={mockUser}
          onClose={onClose}
          onSuspend={onSuspend}
          onDelete={onDelete}
        />
      );

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onSuspend when suspend button is clicked', () => {
      const onClose = jest.fn();
      const onSuspend = jest.fn();
      const onDelete = jest.fn();

      render(
        <UserDetails
          user={mockUser}
          onClose={onClose}
          onSuspend={onSuspend}
          onDelete={onDelete}
        />
      );

      const suspendButton = screen.getByText('Suspend User');
      fireEvent.click(suspendButton);
      expect(onSuspend).toHaveBeenCalled();
    });
  });

  describe('UserActionModal', () => {
    it('renders suspend modal correctly', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={mockUser}
          action="suspend"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Suspend User')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Suspension Reason')).toBeInTheDocument();
    });

    it('renders delete modal correctly', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={mockUser}
          action="delete"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Delete User')).toBeInTheDocument();
      expect(screen.getByText('Deletion Reason')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Irreversible Action')).toBeInTheDocument();
    });

    it('renders unsuspend modal correctly', () => {
      const suspendedUser = { ...mockUser, isSuspended: true };
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={suspendedUser}
          action="unsuspend"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Unsuspend User')).toBeInTheDocument();
      expect(screen.getByText('User Access Restored')).toBeInTheDocument();
    });

    it('requires reason for suspend action', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={mockUser}
          action="suspend"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const suspendButton = screen.getByText('Suspend User');
      expect(suspendButton).toBeDisabled();
    });

    it('enables suspend button when reason is provided', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={mockUser}
          action="suspend"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const reasonInput = screen.getByPlaceholderText(/please provide a reason for suspension/i);
      fireEvent.change(reasonInput, { target: { value: 'Violation of terms' } });

      const suspendButton = screen.getByText('Suspend User');
      expect(suspendButton).not.toBeDisabled();
    });

    it('requires reason for delete action', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={mockUser}
          action="delete"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const deleteButton = screen.getByText('Delete User');
      expect(deleteButton).toBeDisabled();
    });

    it('enables delete button when reason is provided', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={mockUser}
          action="delete"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const reasonInput = screen.getByPlaceholderText(/please provide a reason for deletion/i);
      fireEvent.change(reasonInput, { target: { value: 'User request' } });

      const deleteButton = screen.getByText('Delete User');
      expect(deleteButton).not.toBeDisabled();
    });

    it('does not require reason for unsuspend action', () => {
      const suspendedUser = { ...mockUser, isSuspended: true };
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={suspendedUser}
          action="unsuspend"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const unsuspendButton = screen.getByText('Unsuspend User');
      expect(unsuspendButton).not.toBeDisabled();
    });

    it('calls onCancel when cancel button is clicked', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={mockUser}
          action="suspend"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(onCancel).toHaveBeenCalled();
    });

    it('calls onConfirm with reason when action is submitted', async () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={mockUser}
          action="suspend"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const reasonInput = screen.getByPlaceholderText(/please provide a reason for suspension/i);
      fireEvent.change(reasonInput, { target: { value: 'Violation of terms' } });

      const suspendButton = screen.getByText('Suspend User');
      fireEvent.click(suspendButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith('Violation of terms');
      });
    });

    it('shows error when trying to submit without reason', async () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <UserActionModal
          user={mockUser}
          action="suspend"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const suspendButton = screen.getByText('Suspend User');
      fireEvent.click(suspendButton);

      await waitFor(() => {
        expect(screen.getByText('Please provide a reason for this action.')).toBeInTheDocument();
      });
    });
  });
}); 