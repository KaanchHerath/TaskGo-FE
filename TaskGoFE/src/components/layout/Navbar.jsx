import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaChevronDown, FaBell, FaPlus, FaSearch, FaTasks } from "react-icons/fa";
import { useRef } from "react";
import socketService from "../../services/api/socketService";
import TaskGoLogo from "../common/TaskGoLogo";
import { parseJwt, getToken, clearToken, getCachedUserName } from "../../utils/auth";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationsRef = useRef(null);

  // Helper function to get first word of name
  const getFirstName = (name) => {
    if (!name) return 'User';
    return name.split(' ')[0];
  };

  const checkAuthState = () => {
    const token = getToken();
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        setIsLoggedIn(true);
        setUserRole(payload.role);
        // Get user name from cache instead of JWT token
        const cachedName = getCachedUserName();
        setUserName(cachedName || 'User');
      } else {
        // Invalid token
        clearToken();
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName('');
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
        setUserName('');
    }
  };

  useEffect(() => {
    // Check auth state on mount
    checkAuthState();

    // Listen for storage changes (when localStorage is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuthState();
      }
    };

    // Listen for custom auth state change events
    const handleAuthStateChange = () => {
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    // Setup socket listeners for notifications when logged in
    const handleChatMessage = (data) => {
      const senderName = data?.message?.senderId?.fullName || 'Someone';
      const taskTitle = data?.message?.taskId?.title;
      const text = data?.message?.message || 'You received a new message';
      setNotifications(prev => [
        {
          id: `${data.message?._id || Date.now()}-chat`,
          type: 'chat-message',
          title: `New message from ${senderName}`,
          message: taskTitle ? `${text} · ${taskTitle}` : text,
          meta: { taskId: data.taskId, senderId: data.senderId, senderName },
          createdAt: new Date().toISOString(),
          unread: true
        },
        ...prev
      ].slice(0, 20));
    };

    const handleTaskUpdate = (data) => {
      setNotifications(prev => [
        {
          id: `${data.taskId}-${data.type}-${Date.now()}`,
          type: data.type || 'task-update',
          title: 'Task update',
          message: data.message || 'Your task has an update',
          meta: { taskId: data.taskId, taskTitle: data.taskTitle },
          createdAt: data.timestamp || new Date().toISOString(),
          unread: true
        },
        ...prev
      ].slice(0, 20));
    };

    const handlePaymentSuccess = (data) => {
      setNotifications(prev => [
        {
          id: `${data.paymentId || Date.now()}-payment`,
          type: 'payment-success',
          title: 'Payment successful',
          message: data.message || 'Payment completed successfully',
          meta: { taskId: data.taskId, orderId: data.orderId },
          createdAt: new Date().toISOString(),
          unread: true
        },
        ...prev
      ].slice(0, 20));
    };

    // Connect socket lazily and attach listeners
    if (getToken()) {
      if (!socketService.getConnectionStatus()) {
        socketService.connect();
      }
      socketService.onChatMessage(handleChatMessage);
      socketService.onTaskUpdate(handleTaskUpdate);
      socketService.onPaymentSuccess(handlePaymentSuccess);
    }

    // Also check auth state periodically in case of token changes
    const interval = setInterval(checkAuthState, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      clearInterval(interval);
      socketService.off('chat-message', handleChatMessage);
      socketService.off('task-update', handleTaskUpdate);
      socketService.off('payment-success', handlePaymentSuccess);
    };
  }, []);

  // Check auth state when location changes (for navigation-based auth changes)
  useEffect(() => {
    checkAuthState();
  }, [location]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsOpen && notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName('');
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authStateChanged'));
    
    navigate('/');
  };

  const getDashboardPath = () => {
    switch (userRole) {
      case 'customer': return '/customer/dashboard';
      case 'tasker': return '/tasker/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const getProfilePath = () => {
    switch (userRole) {
      case 'customer': return '/customer/profile';
      case 'tasker': return '/tasker/profile';
      case 'admin': return '/profile';
      default: return '/profile';
    }
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'customer': return 'Customer';
      case 'tasker': return 'Tasker';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };
  const clearAll = () => setNotifications([]);
  const navigateToNotification = (n) => {
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
    setNotificationsOpen(false);
    if (n.meta?.taskId) {
      navigate(`/tasks/${n.meta.taskId}`);
    }
  };

  return (
    <nav className="bg-white/60 backdrop-blur-md border-b border-white/20 shadow-sm fixed w-full top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Corner */}
          <div className="flex items-center">
            <Link to={getDashboardPath()} className="flex items-center space-x-3 group">
              <div className="group-hover:scale-105 transition-transform duration-200">
                <TaskGoLogo size={40} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                TaskGo
              </span>
            </Link>
          </div>

          {/* Center Navigation Links - Absolutely Centered */}
          <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            {/* Admin Navigation */}
            {userRole === 'admin' ? (
              <>
                <Link 
                  to="/admin" 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink('/admin') 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/taskers" 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink('/admin/taskers') 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Taskers
                </Link>
                <Link 
                  to="/admin/tasks" 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink('/admin/tasks') 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Tasks
                </Link>
                <Link 
                  to="/admin/users" 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink('/admin/users') 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Users
                </Link>
              </>
            ) : (
              <>
                {/* Regular User Navigation */}
                <Link 
                  to={getDashboardPath()} 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink(getDashboardPath()) 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                {userRole === 'tasker' && (
                  <Link 
                    to="/tasks" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/tasks') 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Tasks
                  </Link>
                )}
                {(userRole === 'customer' || userRole === 'tasker') && (
                  <Link 
                    to="/my-tasks" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/my-tasks') 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    My Tasks
                  </Link>
                )}
                <Link 
                  to="/categories" 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink('/categories') 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Categories
                </Link>
                {userRole === 'customer' && (
                  <Link 
                    to="/taskers" 
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActiveLink('/taskers') 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    Taskers
                  </Link>
                )}
                <Link 
                  to="/contact" 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink('/contact') 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Contact
                </Link>
              </>
            )}
          </div>

          {/* Right Side - Authentication Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {/* Post a Task Button - Only for Customers */}
                {userRole === 'customer' && (
                  <Link 
                    to="/post-task" 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-blue-200"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Post Task</span>
                  </Link>
                )}

                {/* Browse Tasks Button - Only for Taskers */}
                {userRole === 'tasker' && (
                  <Link 
                    to="/tasks" 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-green-200"
                  >
                    <FaSearch className="w-4 h-4" />
                    <span>Browse Tasks</span>
                  </Link>
                )}

                {/* Notification Icon + Dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button 
                    className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all duration-200 relative"
                    onClick={() => setNotificationsOpen(v => !v)}
                    title="Notifications"
                  >
                    <FaBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-96 max-w-[95vw] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl py-2 z-50 border border-slate-200/60">
                      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-200/60">
                        <div className="font-semibold text-slate-800">Notifications</div>
                        <div className="space-x-2">
                          <button onClick={markAllRead} className="text-xs text-slate-500 hover:text-slate-700">Mark all read</button>
                          <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600">Clear</button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-slate-500 text-sm">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => navigateToNotification(n)}
                              className={`w-full text-left px-4 py-3 flex items-start space-x-3 hover:bg-slate-50 transition-colors ${n.unread ? 'bg-blue-50/40' : ''}`}
                            >
                              <div className={`mt-1 h-2 w-2 rounded-full ${n.unread ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-800">{n.title}</div>
                                <div className="text-sm text-slate-600">{n.message}</div>
                                <div className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Button */}
                <div className="relative profile-menu-container">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-3 bg-slate-50 hover:bg-slate-100 rounded-xl px-3 py-2 transition-all duration-200 border border-slate-200/60"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <FaUser className="text-white text-xs" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-800 leading-tight">
                        {getFirstName(userName)}
                        </div>
                        <div className="text-xs text-slate-500 leading-tight">
                         {getRoleDisplayName()}
                        </div>
                      </div>
                    </div>
                    <FaChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
                      isProfileMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl py-2 z-50 border border-slate-200/60 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-200/60">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <FaUser className="text-white text-sm" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{getFirstName(userName)}</div>
                            <div className="text-sm text-slate-500">{getRoleDisplayName()}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link 
                          to={getProfilePath()} 
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" 
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <FaUser className="w-3 h-3 text-slate-600" />
                          </div>
                          <span>Profile Settings</span>
                        </Link>
                        <Link 
                          to={getDashboardPath()} 
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" 
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <FaTasks className="w-3 h-3 text-slate-600" />
                          </div>
                          <span>Dashboard</span>
                        </Link>
                      </div>
                      
                      <div className="border-t border-slate-200/60 py-2">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-slate-600 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-xl hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-blue-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-md border-t border-slate-200/60 rounded-b-2xl">
              <Link 
                to={getDashboardPath()} 
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActiveLink(getDashboardPath()) 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {userRole === 'tasker' && (
                <Link 
                  to="/tasks" 
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink('/tasks') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tasks
                </Link>
              )}
              {(userRole === 'customer' || userRole === 'tasker') && (
                <Link 
                  to="/my-tasks" 
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink('/my-tasks') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Tasks
                </Link>
              )}
              <Link 
                to="/categories" 
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActiveLink('/categories') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              {userRole === 'customer' && (
                <Link 
                  to="/taskers" 
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveLink('/taskers') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Taskers
                </Link>
              )}
              <Link 
                to="/contact" 
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActiveLink('/contact') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="border-t border-slate-200/60 my-3"></div>
              
              {/* Action Buttons for Mobile */}
              {isLoggedIn && userRole === 'customer' && (
                <Link 
                  to="/post-task" 
                  className="block mx-2 my-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 text-center font-medium shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaPlus className="inline w-4 h-4 mr-2" />
                  Post a Task
                </Link>
              )}

              {isLoggedIn && userRole === 'tasker' && (
                <Link 
                  to="/tasks" 
                  className="block mx-2 my-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 text-center font-medium shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaSearch className="inline w-4 h-4 mr-2" />
                  Browse Tasks
                </Link>
              )}

              {isLoggedIn ? (
                <>
                  <div className="px-4 py-3 bg-slate-50 rounded-xl mx-2 my-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <FaUser className="text-white text-sm" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{getFirstName(userName)}</div>
                        <div className="text-sm text-slate-500">{getRoleDisplayName()}</div>
                      </div>
                    </div>
                  </div>
                  <Link 
                    to={getProfilePath()} 
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link 
                    to={getDashboardPath()} 
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block mx-2 my-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 text-center font-medium shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;