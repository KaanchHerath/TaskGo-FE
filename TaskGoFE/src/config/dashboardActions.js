import { FaPlus, FaSearch, FaUsers, FaUser, FaTasks, FaEye } from 'react-icons/fa';

export const customerActions = [
  { 
    title: "Post New Task", 
    description: "Get help with your tasks", 
    icon: FaPlus, 
    color: "from-blue-500 to-blue-600",
    link: "/post-task"
  },
  { 
    title: "Browse Tasks", 
    description: "Find available tasks", 
    icon: FaSearch, 
    color: "from-green-500 to-green-600",
    link: "/tasks"
  },
  { 
    title: "Find Taskers", 
    description: "Hire skilled professionals", 
    icon: FaUsers, 
    color: "from-purple-500 to-purple-600",
    link: "/taskers"
  },
  { 
    title: "My Profile", 
    description: "Manage your account", 
    icon: FaUser, 
    color: "from-orange-500 to-orange-600",
    link: "/profile"
  }
];

export const taskerActions = [
  { 
    title: "Browse Tasks", 
    description: "Find available tasks", 
    icon: FaSearch, 
    color: "from-green-500 to-green-600",
    link: "/tasks"
  },
  { 
    title: "My Applications", 
    description: "Track your applications", 
    icon: FaTasks, 
    color: "from-blue-500 to-blue-600",
    link: "/applications"
  },
  { 
    title: "My Profile", 
    description: "Update your profile", 
    icon: FaUser, 
    color: "from-purple-500 to-purple-600",
    link: "/tasker/profile"
  },
  { 
    title: "View Earnings", 
    description: "Check your earnings", 
    icon: FaEye, 
    color: "from-orange-500 to-orange-600",
    link: "/earnings"
  }
]; 