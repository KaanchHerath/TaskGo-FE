import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskManagement from '../TaskManagement';
import { getTasks, updateTaskStatus } from '../../../services/api/adminService';

// Mock the API service
jest.mock('../../../services/api/adminService');

const mockTasks = [
  {
    _id: '1',
    title: 'House Cleaning',
    description: 'Need house cleaning service',
    category: 'Cleaning',
    status: 'active',
    area: 'Colombo',
    minPayment: 1000,
    maxPayment: 2000,
    createdAt: '2024-01-01T00:00:00.000Z',
    customer: {
      _id: 'customer1',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890'
    },
    selectedTasker: null,
    applicationCount: 3
  },
  {
    _id: '2',
    title: 'Garden Maintenance',
    description: 'Regular garden maintenance',
    category: 'Gardening',
    status: 'completed',
    area: 'Kandy',
    minPayment: 1500,
    maxPayment: 2500,
    createdAt: '2024-01-02T00:00:00.000Z',
    customer: {
      _id: 'customer2',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0987654321'
    },
    selectedTasker: {
      _id: 'tasker1',
      fullName: 'Bob Wilson',
      email: 'bob@example.com'
    },
    applicationCount: 5
  }
];

const mockApiResponse = {
  data: mockTasks,
  pagination: {
    page: 1,
    limit: 15,
    total: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  }
};

describe('TaskManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getTasks.mockResolvedValue(mockApiResponse);
  });

  test('renders task management interface', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Task Filters')).toBeInTheDocument();
      expect(screen.getByText('Tasks (2)')).toBeInTheDocument();
    });
  });

  test('displays task list with correct information', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('House Cleaning')).toBeInTheDocument();
      expect(screen.getByText('Garden Maintenance')).toBeInTheDocument();
      expect(screen.getByText('Cleaning')).toBeInTheDocument();
      expect(screen.getByText('Gardening')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('shows correct status badges', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  test('filters tasks by search term', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'cleaning' } });

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'cleaning'
        })
      );
    });
  });

  test('filters tasks by status', async () => {
    render(<TaskManagement />);
    
    const statusSelect = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active'
        })
      );
    });
  });

  test('filters tasks by category', async () => {
    render(<TaskManagement />);
    
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'Cleaning' } });

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Cleaning'
        })
      );
    });
  });

  test('filters tasks by date range', async () => {
    render(<TaskManagement />);
    
    const dateFromInput = screen.getByDisplayValue('');
    fireEvent.change(dateFromInput, { target: { value: '2024-01-01' } });

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: '2024-01-01'
        })
      );
    });
  });

  test('sorts tasks by column', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Task')).toBeInTheDocument();
    });

    const taskHeader = screen.getByText('Task');
    fireEvent.click(taskHeader);

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'title',
          sortOrder: 'asc'
        })
      );
    });
  });

  test('handles pagination', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2
        })
      );
    });
  });

  test('opens task details modal', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByTitle('View Details');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Task Details')).toBeInTheDocument();
    });
  });

  test('shows pause action for active tasks', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    });

    const pauseButtons = screen.getAllByTitle('Pause Task');
    expect(pauseButtons).toHaveLength(1);
  });

  test('shows resume action for paused tasks', async () => {
    const pausedTasks = [
      {
        ...mockTasks[0],
        status: 'paused'
      }
    ];

    getTasks.mockResolvedValue({
      ...mockApiResponse,
      data: pausedTasks
    });

    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    });

    const resumeButtons = screen.getAllByTitle('Resume Task');
    expect(resumeButtons).toHaveLength(1);
  });

  test('shows complete action for in-progress tasks', async () => {
    const inProgressTasks = [
      {
        ...mockTasks[0],
        status: 'in_progress'
      }
    ];

    getTasks.mockResolvedValue({
      ...mockApiResponse,
      data: inProgressTasks
    });

    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    });

    const completeButtons = screen.getAllByTitle('Mark Complete');
    expect(completeButtons).toHaveLength(1);
  });

  test('opens status update modal', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    });

    const pauseButton = screen.getByTitle('Pause Task');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText('Pause Task')).toBeInTheDocument();
    });
  });

  test('clears all filters', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          search: '',
          status: '',
          category: '',
          customerId: '',
          taskerId: '',
          dateFrom: '',
          dateTo: '',
          minPayment: '',
          maxPayment: ''
        })
      );
    });
  });

  test('displays loading state', () => {
    getTasks.mockImplementation(() => new Promise(() => {}));
    
    render(<TaskManagement />);
    
    expect(screen.getByText('Task Filters')).toBeInTheDocument();
    // Loading skeleton should be visible
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    getTasks.mockRejectedValue(new Error('API Error'));
    
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Task Filters')).toBeInTheDocument();
    });
  });

  test('displays pagination information correctly', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Showing 1 to 2 of 2 results')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });
  });

  test('formats currency correctly', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('LKR 1,000 - 2,000')).toBeInTheDocument();
      expect(screen.getByText('LKR 1,500 - 2,500')).toBeInTheDocument();
    });
  });

  test('displays application count', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('3 applications')).toBeInTheDocument();
      expect(screen.getByText('5 applications')).toBeInTheDocument();
    });
  });

  test('shows tasker information when assigned', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });
  });

  test('displays task location', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Colombo')).toBeInTheDocument();
      expect(screen.getByText('Kandy')).toBeInTheDocument();
    });
  });

  test('shows task creation date', async () => {
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument();
    });
  });
});

describe('TaskManagement Integration', () => {
  test('refreshes data after status update', async () => {
    updateTaskStatus.mockResolvedValue({ success: true });
    
    render(<TaskManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    });

    const pauseButton = screen.getByTitle('Pause Task');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText('Pause Task')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Pause Task');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(updateTaskStatus).toHaveBeenCalled();
      expect(getTasks).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  test('maintains filter state across refreshes', async () => {
    render(<TaskManagement />);
    
    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'cleaning' } });

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'cleaning'
        })
      );
    });

    // Simulate a refresh
    getTasks.mockClear();
    render(<TaskManagement />);

    await waitFor(() => {
      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'cleaning'
        })
      );
    });
  });
}); 