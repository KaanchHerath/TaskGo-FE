import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common chart options for better styling
const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 14,
          weight: '600',
        },
        color: '#475569',
      },
    },
    title: {
      display: true,
      font: {
        size: 20,
        weight: '700',
      },
      color: '#1e293b',
      padding: {
        top: 20,
        bottom: 30,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#f8fafc',
      bodyColor: '#f1f5f9',
      borderColor: '#334155',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        size: 14,
        weight: '600',
      },
      bodyFont: {
        size: 13,
      },
      padding: 12,
    },
  },
};

// Task Status Chart Component
export const TaskStatusChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: 'Tasks',
        data: data?.values || [0, 0, 0, 0],
        backgroundColor: [
          'rgba(245, 158, 11, 0.85)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(34, 197, 94, 0.85)',
          'rgba(239, 68, 68, 0.85)',
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: 'Task Status Distribution',
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-100">
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

// User Registration Trend Chart
export const UserRegistrationChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: 'New Users',
        data: data?.values || [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: 'User Registration Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 13,
            weight: '500',
          },
          color: '#64748b',
        },
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          font: {
            size: 13,
            weight: '500',
          },
          color: '#64748b',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-100">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

// Monthly Revenue Chart
export const RevenueChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: 'Revenue',
        data: data?.values || [],
        backgroundColor: 'rgba(34, 197, 94, 0.85)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 3,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(34, 197, 94, 1)',
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: 'Monthly Revenue',
      },
      tooltip: {
        ...commonChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
          font: {
            size: 13,
            weight: '500',
          },
          color: '#64748b',
        },
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          font: {
            size: 13,
            weight: '500',
          },
          color: '#64748b',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-100">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Task Completion Trend Chart
export const TaskCompletionChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: 'Completed Tasks',
        data: data?.completed || [],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Total Tasks',
        data: data?.total || [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: 'Task Completion Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 13,
            weight: '500',
          },
          color: '#64748b',
        },
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          font: {
            size: 13,
            weight: '500',
          },
          color: '#64748b',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-100">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

// User Type Distribution Chart
export const UserTypeChart = ({ data }) => {
  const chartData = {
    labels: ['Customers', 'Taskers', 'Admins'],
    datasets: [
      {
        data: data || [0, 0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)',
          'rgba(34, 197, 94, 0.85)',
          'rgba(239, 68, 68, 0.85)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: 'User Type Distribution',
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-100">
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

// Platform Revenue Chart Component
export const PlatformRevenueChart = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Platform Revenue (LKR)',
        data: data?.values || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 4,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 7,
        pointHoverRadius: 9,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: 'Platform Revenue (10% Commission from Advance Payments)',
        font: {
          size: 18,
          weight: '700',
        },
      },
      tooltip: {
        ...commonChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: LKR ${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          callback: function(value) {
            return 'LKR ' + value.toLocaleString();
          },
          font: {
            size: 13,
            weight: '500',
          },
          color: '#64748b',
        },
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          font: {
            size: 13,
            weight: '500',
          },
          color: '#64748b',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-100">
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}; 