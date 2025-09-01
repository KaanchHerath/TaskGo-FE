import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PendingTaskers from '../PendingTaskers';
import TaskerDetails from '../TaskerDetails';
import ApprovalModal from '../ApprovalModal';
import DocumentViewer from '../DocumentViewer';

// Mock the admin service
jest.mock('../../../services/api/adminService', () => ({
  getPendingTaskers: jest.fn(),
  approveTasker: jest.fn(),
  rejectTasker: jest.fn(),
}));

// Mock data
const mockTasker = {
  _id: '1',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  createdAt: '2024-01-01T00:00:00.000Z',
  taskerProfile: {
    province: 'Western Province',
    district: 'Colombo',
    experience: '3-5 years',
    skills: ['cleaning', 'gardening', 'plumbing'],
    hourlyRate: 25,
    bio: 'Experienced tasker with 5 years of experience',
    isAvailable: true,
    advancePaymentAmount: 50,
    idDocument: 'https://example.com/id.pdf',
    qualificationDocuments: ['https://example.com/qual1.pdf', 'https://example.com/qual2.pdf']
  }
};

const mockPendingTaskersResponse = {
  taskers: [mockTasker],
  total: 1,
  page: 1,
  limit: 10
};

describe('Tasker Approval Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PendingTaskers', () => {
    it('renders loading state initially', () => {
      render(<PendingTaskers />);
      expect(screen.getByText(/pending tasker approvals/i)).toBeInTheDocument();
    });

    it('displays taskers list when data is loaded', async () => {
      const { getPendingTaskers } = require('../../../services/api/adminService');
      getPendingTaskers.mockResolvedValue(mockPendingTaskersResponse);

      render(<PendingTaskers />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('handles search functionality', async () => {
      const { getPendingTaskers } = require('../../../services/api/adminService');
      getPendingTaskers.mockResolvedValue(mockPendingTaskersResponse);

      render(<PendingTaskers />);
      
      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(getPendingTaskers).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'John' })
        );
      });
    });
  });

  describe('TaskerDetails', () => {
    it('renders tasker information correctly', () => {
      const onClose = jest.fn();
      const onApprove = jest.fn();
      const onReject = jest.fn();

      render(
        <TaskerDetails
          tasker={mockTasker}
          onClose={onClose}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('Western Province, Colombo')).toBeInTheDocument();
      expect(screen.getByText('3-5 years')).toBeInTheDocument();
      expect(screen.getByText('$25')).toBeInTheDocument();
    });

    it('displays document information', () => {
      const onClose = jest.fn();
      const onApprove = jest.fn();
      const onReject = jest.fn();

      render(
        <TaskerDetails
          tasker={mockTasker}
          onClose={onClose}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      expect(screen.getByText('ID Document')).toBeInTheDocument();
      expect(screen.getByText('Qualification Documents')).toBeInTheDocument();
      expect(screen.getByText('id.pdf')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      const onApprove = jest.fn();
      const onReject = jest.fn();

      render(
        <TaskerDetails
          tasker={mockTasker}
          onClose={onClose}
          onApprove={onApprove}
          onReject={onReject}
        />
      );

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('ApprovalModal', () => {
    it('renders approval modal correctly', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <ApprovalModal
          tasker={mockTasker}
          action="approve"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Approve Tasker')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('renders rejection modal correctly', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <ApprovalModal
          tasker={mockTasker}
          action="reject"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Reject Tasker')).toBeInTheDocument();
      expect(screen.getByText('Rejection Reason')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/please provide a reason for rejection/i)).toBeInTheDocument();
    });

    it('requires reason for rejection', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <ApprovalModal
          tasker={mockTasker}
          action="reject"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const rejectButton = screen.getByText('Reject Tasker');
      expect(rejectButton).toBeDisabled();
    });

    it('enables rejection button when reason is provided', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(
        <ApprovalModal
          tasker={mockTasker}
          action="reject"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const reasonInput = screen.getByPlaceholderText(/please provide a reason for rejection/i);
      fireEvent.change(reasonInput, { target: { value: 'Insufficient experience' } });

      const rejectButton = screen.getByText('Reject Tasker');
      expect(rejectButton).not.toBeDisabled();
    });
  });

  describe('DocumentViewer', () => {
    it('renders document viewer correctly', () => {
      const document = {
        url: 'https://example.com/test.pdf',
        type: 'ID Document'
      };
      const onClose = jest.fn();

      render(
        <DocumentViewer
          document={document}
          onClose={onClose}
        />
      );

      expect(screen.getByText('ID Document')).toBeInTheDocument();
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('handles PDF documents', () => {
      const document = {
        url: 'https://example.com/test.pdf',
        type: 'ID Document'
      };
      const onClose = jest.fn();

      render(
        <DocumentViewer
          document={document}
          onClose={onClose}
        />
      );

      // Check if PDF icon is displayed
      const pdfIcon = document.querySelector('.text-red-500');
      expect(pdfIcon).toBeInTheDocument();
    });

    it('handles image documents', () => {
      const document = {
        url: 'https://example.com/test.jpg',
        type: 'Qualification Document'
      };
      const onClose = jest.fn();

      render(
        <DocumentViewer
          document={document}
          onClose={onClose}
        />
      );

      // Check if image icon is displayed
      const imageIcon = document.querySelector('.text-green-500');
      expect(imageIcon).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const document = {
        url: 'https://example.com/test.pdf',
        type: 'ID Document'
      };
      const onClose = jest.fn();

      render(
        <DocumentViewer
          document={document}
          onClose={onClose}
        />
      );

      const closeButton = screen.getByTitle('Close');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });
  });
}); 