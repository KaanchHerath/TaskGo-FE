import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { parseJwt, roleToDashboard, getToken } from "./utils/auth";
import Layout from "./components/layout/Layout";
import useScrollToTop from "./hooks/useScrollToTop";

// ScrollToTop component
const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

// Common Pages
import Home from "./pages/common/Home";
import Contact from "./pages/common/Contact";
import Categories from "./pages/common/Categories";
import Services from "./pages/common/Services";
import Tasks from "./pages/common/Tasks";
import Taskers from "./pages/common/Taskers";
import MyTasks from "./pages/common/MyTasks";

// Existing pages in root
import BrowseJobs from "./pages/BrowseJobs";
import PostTask from "./pages/PostTask";
import TaskDetails from "./pages/TaskDetails";
import PublicTaskerProfile from "./pages/TaskerProfile";

// Auth Pages
import Login from "./pages/auth/Login";
import SignupSelection from "./pages/auth/SignupSelection";
import CustomerSignup from "./pages/auth/CustomerSignup";
import TaskerSignup from "./pages/auth/TaskerSignup";

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerProfile from "./pages/customer/Profile";
import CustomerCategories from "./pages/customer/CustomerCategories";
import TaskApplicationsPage from "./pages/customer/TaskApplicationsPage";

// Tasker Pages
import TaskerDashboard from "./pages/tasker/Dashboard";
import TaskerProfile from "./pages/tasker/Profile";
import TaskerCategories from "./pages/tasker/Categories";
import TaskerTaskView from "./pages/tasker/TaskerTaskView";
import WaitingApprovalPage from "./pages/tasker/WaitingApprovalPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import TaskerApproval from "./pages/admin/TaskerApproval";
import UserManagementPage from "./pages/admin/UserManagementPage";
import TaskManagementPage from "./pages/admin/TaskManagementPage";

// Payment Pages
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentCancelled from "./pages/PaymentCancelled";

// Components
import PrivateRoute from "./utils/PrivateRoute";
import TaskerApprovalCheck from "./components/common/TaskerApprovalCheck";
import GlobalApprovalGate from "./components/common/GlobalApprovalGate";

// Dashboard redirect component
const DashboardRedirect = () => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  const payload = parseJwt(token);
  const userRole = payload?.role;
  
  // For taskers, we need to check if they can access the dashboard
  // Since the backend prevents unapproved taskers from logging in,
  // if they have a token, they should be approved
  // But we'll add a safety check here
  if (userRole === 'tasker') {
    // Check if tasker is approved by looking at the token payload
    // If not approved, redirect to waiting approval page
    const isApproved = payload?.isApproved;
    if (!isApproved) {
      return <Navigate to="/tasker/waiting-approval" replace />;
    }
  }
  
  const dashboard = roleToDashboard[userRole] || '/';
  return <Navigate to={dashboard} replace />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* Global gate: any logged-in unapproved tasker is redirected */}
          <Route element={<GlobalApprovalGate />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/taskers" element={<Taskers />} />
          <Route path="/taskers/:id" element={<PublicTaskerProfile />} />
          <Route path="/browse-jobs" element={<BrowseJobs />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route element={<PrivateRoute allowedRoles={['customer']} />}>
            <Route path="/post-task" element={<PostTask />} />
          </Route>
          <Route path="/tasks/:id" element={<TaskDetails />} />
          
          {/* General Dashboard Route - Redirects to role-specific dashboard */}
          <Route element={<PrivateRoute allowedRoles={["customer", "tasker", "admin"]} />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
          </Route>
          
          {/* My Tasks - Protected route for customers and taskers */}
          <Route element={<PrivateRoute allowedRoles={['customer', 'tasker']} />}>
            <Route path="/my-tasks" element={<MyTasks />} />
          </Route>

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupSelection />} />
          <Route path="/signup/customer" element={<CustomerSignup />} />
          <Route path="/signup/tasker" element={<TaskerSignup />} />

          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/payment/cancelled" element={<PaymentCancelled />} />

          {/* Customer Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={["customer"]} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/categories" element={<CustomerCategories />} />
            <Route path="/customer/my-tasks/:taskId/applications" element={<TaskApplicationsPage />} />
          </Route>

          {/* Tasker Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={["tasker"]} />}>
            <Route path="/tasker/waiting-approval" element={<WaitingApprovalPage />} />
            <Route element={<TaskerApprovalCheck />}>
              <Route path="/tasker/dashboard" element={<TaskerDashboard />} />
              <Route path="/tasker/profile" element={<TaskerProfile />} />
              <Route path="/tasker/categories" element={<TaskerCategories />} />
              <Route path="/tasker/task/:taskId" element={<TaskerTaskView />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/taskers" element={<AdminDashboard />} />
            <Route path="/admin/tasks" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/tasker-approval" element={<TaskerApproval />} />
            <Route path="/admin/user-management" element={<UserManagementPage />} />
            <Route path="/admin/task-management" element={<TaskManagementPage />} />
          </Route>

          {/* Legacy redirects for backward compatibility */}
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/tasker-dashboard" element={<TaskerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* Profile route accessible to all logged-in users */}
          <Route element={<PrivateRoute allowedRoles={["customer", "tasker", "admin"]} />}>
            <Route path="/profile" element={<CustomerProfile />} />
          </Route>
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;