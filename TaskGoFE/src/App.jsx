import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

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

// Auth Pages
import Login from "./pages/auth/Login";
import SignupSelection from "./pages/auth/SignupSelection";
import CustomerSignup from "./pages/auth/CustomerSignup";
import TaskerSignup from "./pages/auth/TaskerSignup";

// Customer Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerProfile from "./pages/customer/Profile";
import TaskApplicationsPage from "./pages/customer/TaskApplicationsPage";

// Tasker Pages
import TaskerDashboard from "./pages/tasker/Dashboard";
import TaskerProfile from "./pages/tasker/Profile";
import TaskerTaskView from "./pages/tasker/TaskerTaskView";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";

// Components
import PrivateRoute from "./components/common/PrivateRoute";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/taskers" element={<Taskers />} />
          <Route path="/browse-jobs" element={<BrowseJobs />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route element={<PrivateRoute allowedRoles={['customer']} />}>
            <Route path="/post-task" element={<PostTask />} />
          </Route>
          <Route path="/tasks/:id" element={<TaskDetails />} />
          
          {/* My Tasks - Protected route for customers and taskers */}
          <Route element={<PrivateRoute allowedRoles={['customer', 'tasker']} />}>
            <Route path="/my-tasks" element={<MyTasks />} />
          </Route>

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupSelection />} />
          <Route path="/signup/customer" element={<CustomerSignup />} />
          <Route path="/signup/tasker" element={<TaskerSignup />} />

          {/* Customer Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={["customer"]} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/my-tasks/:taskId/applications" element={<TaskApplicationsPage />} />
          </Route>

          {/* Tasker Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={["tasker"]} />}>
            <Route path="/tasker/dashboard" element={<TaskerDashboard />} />
            <Route path="/tasker/profile" element={<TaskerProfile />} />
            <Route path="/tasker/task/:taskId" element={<TaskerTaskView />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Legacy redirects for backward compatibility */}
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/tasker-dashboard" element={<TaskerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
          {/* Profile route accessible to all logged-in users */}
          <Route element={<PrivateRoute allowedRoles={["customer", "tasker", "admin"]} />}>
            <Route path="/profile" element={<CustomerProfile />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;