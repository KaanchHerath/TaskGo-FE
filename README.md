# TaskGo Frontend Application

TaskGo is an on-demand gig worker platform that connects customers with skilled local service providers in real-time. It ensures seamless service matching, secure transactions, and flexible scheduling, making everyday tasks effortless.

TaskGo is a comprehensive task management and service marketplace platform built with React. It connects customers who need tasks completed with skilled taskers who can perform various services.

## 🚀 Features

- **User Management**: Customer and Tasker registration with role-based access
- **Task Management**: Post, browse, and manage tasks with categories
- **Payment Integration**: Secure payment processing via PayHere gateway
- **Real-time Chat**: WebSocket-based communication between users
- **Admin Dashboard**: Comprehensive admin panel for platform management
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Authentication**: JWT-based secure authentication system

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4.0
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Chart.js with React Chart.js 2
- **Icons**: Lucide React & React Icons
- **Build Tool**: Vite 6.2

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Backend API** running (see backend setup instructions)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TaskGo-FE/TaskGoFE
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run tailwind` - Watch Tailwind CSS for changes

## 💳 Payment Gateway Setup

### Important: Demo Configuration

**⚠️ This project is currently configured for demonstration purposes only. The backend is not hosted yet, so payment functionality requires local development setup.**

### Setting Up PayHere Payment Gateway

1. **Backend Setup with ngrok**:
   - Start your backend server locally
   - Install ngrok: `npm install -g ngrok`
   - Run ngrok to expose your local backend: `ngrok http 5000`
   - Copy the ngrok URL (e.g., `https://abc123.ngrok-free.app`)

2. **Update Payment Modal Configuration**:
   - Open `src/components/common/PaymentModal.jsx`
   - Find line 193 with the `notify_url` configuration
   - Replace the ngrok URL with your current one:
   ```javascript
   "notify_url": "https://YOUR_NGROK_URL.ngrok-free.app/api/payments/notify"
   ```

3. **PayHere Merchant Configuration**:
   - Replace the demo merchant ID in the PaymentModal
   - Update other payment gateway settings as needed

### Why ngrok is Required

Since the backend is not hosted yet, ngrok creates a secure tunnel to your local backend, allowing PayHere to send payment notifications to your local development environment. This is essential for testing payment flows during development.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   ├── layout/         # Layout components
│   ├── task/           # Task-related components
│   └── tasker/         # Tasker-specific components
├── pages/              # Page components
├── services/           # API service functions
├── store/              # Redux store configuration
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── config/             # Configuration files
```

## 🔐 User Types & Capabilities

TaskGo supports three distinct user types, each with specific roles and capabilities:

### 👤 **Customer**
- **Post Tasks**: Create and publish new service requests
- **Browse Taskers**: View profiles and ratings of available service providers
- **Hire Services**: Select and hire taskers for specific tasks
- **Manage Tasks**: Track task progress, communicate with taskers, and manage ongoing services
- **Payment Management**: Handle advance payments and final payments securely
- **Rate & Review**: Provide feedback and ratings for completed services
- **Profile Management**: Update personal information and preferences

### 🛠️ **Tasker**
- **Browse Available Tasks**: View and search for tasks in their service categories
- **Apply for Tasks**: Submit applications and proposals for tasks
- **Service Delivery**: Complete assigned tasks and provide quality service
- **Communication**: Chat with customers to clarify requirements and provide updates
- **Earnings Management**: Track completed tasks, payments, and earnings
- **Profile & Portfolio**: Showcase skills, experience, and completed work
- **Availability Management**: Set working hours and availability status

### 👨‍💼 **Admin**
- **Platform Management**: Oversee all platform operations and user activities
- **User Management**: Approve tasker registrations, manage user accounts, and handle disputes
- **Task Oversight**: Monitor task creation, progress, and completion across the platform
- **Analytics & Reports**: Access comprehensive platform statistics and performance metrics
- **Content Moderation**: Review and approve user-generated content and task descriptions
-

## 🔐 Authentication

The application uses JWT tokens for authentication. Users can register as either:
- **Customers**: Can post tasks and hire taskers
- **Taskers**: Can apply for tasks and provide services
- **Admins**: Have access to admin dashboard and platform management

## 📱 Responsive Design

Built with Tailwind CSS for mobile-first responsive design. The application works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices


```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Hosting

The built files in the `dist/` folder can be deployed to:
- Vercel
- Netlify
- AWS S3
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the backend documentation
- Review API endpoints documentation
- Contact the development team

## 🔄 Updates

This README will be updated as the project evolves. The current configuration is for development and demonstration purposes only.
