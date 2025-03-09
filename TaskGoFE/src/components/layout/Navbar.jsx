import { useState } from "react";
import { FaUser, FaChevronDown } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">TaskGo</span>
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
              <Link to="/tasks" className="text-gray-700 hover:text-gray-900">Tasks</Link>
              <Link to="/categories" className="text-gray-700 hover:text-gray-900">Categories</Link>
              <Link to="/contact" className="text-gray-700 hover:text-gray-900">Contact Us</Link>
            </div>
          </div>

          {/* Action Buttons - Right */}
          <div className="flex items-center space-x-4">
            <Link to="/tasks" className="text-gray-700 hover:text-gray-900">
              Browse Jobs
            </Link>
            <Link 
              to="/post-task" 
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Post a Job
            </Link>
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-700 hover:text-gray-900 flex items-center"
            >
              Login
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;