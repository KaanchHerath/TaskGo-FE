import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaPlus, FaUsers, FaTasks, FaDollarSign, FaCheck, FaTools, FaWrench, FaBroom, FaCog, FaPlug, FaHammer, FaLeaf, FaTree, FaShieldAlt, FaClock, FaThumbsUp, FaAward, FaHandshake, FaUserCheck } from "react-icons/fa";
import homeImage from "../../assets/homeimage.png";
import { taskService } from "../../services/api/taskService";
import { getToken } from '../../utils/auth';
import { dashboardCategories, generateCategoriesWithMetadata } from '../../config/categories';
import { getDashboardStats } from '../../services/api/statsService';

// Import reusable components
import HeroSection from '../../components/common/HeroSection';
import StatsSection from '../../components/common/StatsSection';
import CategoriesGrid from '../../components/common/CategoriesGrid';
import RecentReviews from '../../components/common/RecentReviews';



// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Post Your Task",
      description: "Describe what you need done and set your budget. It's free to post!",
      icon: <FaPlus className="text-2xl" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "02", 
      title: "Get Offers",
      description: "Receive offers from skilled taskers in your area within minutes.",
      icon: <FaUsers className="text-2xl" />,
      color: "from-green-500 to-green-600"
    },
    {
      number: "03",
      title: "Choose Your Tasker",
      description: "Review profiles, ratings, and select the perfect tasker for your job.",
      icon: <FaUserCheck className="text-2xl" />,
      color: "from-purple-500 to-purple-600"
    },
    {
      number: "04",
      title: "Get It Done",
      description: "Relax while your chosen tasker completes the job to your satisfaction.",
      icon: <FaCheck className="text-2xl" />,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-16 bg-white relative">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              How TaskGo Works
            </span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Getting help with your tasks has never been easier. Follow these simple steps to get started.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="group relative">
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200 transform translate-x-4"></div>
              )}
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center relative z-10">
                <div className="relative mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                    <div className="text-white">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-slate-600">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Why Choose TaskGo Section
const WhyChooseSection = () => {
  const features = [
    {
      title: "Verified Professionals",
      description: "All taskers are background-checked and verified for your peace of mind.",
      icon: <FaShieldAlt className="text-2xl" />,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Secure Payments",
      description: "Safe and secure payment processing with money-back guarantee.",
      icon: <FaDollarSign className="text-2xl" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock customer support to help you every step of the way.",
      icon: <FaClock className="text-2xl" />,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Quality Guarantee",
      description: "Satisfaction guaranteed or we'll make it right. Your happiness is our priority.",
      icon: <FaAward className="text-2xl" />,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-16 bg-white relative">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Why Choose TaskGo?
            </span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            We're committed to providing the best experience for both customers and taskers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center">
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Call to Action Section
const CallToActionSection = () => (
  <section className="py-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="absolute top-0 left-0 w-full h-full opacity-10">
      <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
    </div>
    
    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Ready to Get Started?
      </h2>
      <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
        Join thousands of satisfied customers and skilled taskers. 
        Post your first task or start earning money today!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/signup/customer" 
          className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg transform hover:scale-105"
        >
          <FaPlus className="mr-2" />
          Post Your First Task
        </Link>
        <Link 
          to="/signup/tasker" 
          className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg"
        >
          <FaHandshake className="mr-2" />
          Start Earning as a Tasker
        </Link>
      </div>
    </div>
  </section>
);

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  // Hero section configuration
  const heroConfig = {
    title: "Get Things Done",
    subtitle: "The Smart Way",
    description: "Connect with skilled professionals for any task. From home repairs to personal assistance, TaskGo makes it easy to get help when you need it.",
    primaryButton: {
      text: "Post a Task",
      to: "/signup/customer",
      icon: <FaPlus />
    },
    secondaryButton: {
      text: "Become a Tasker",
      to: "/signup/tasker",
      icon: <FaUsers />
    },
    image: homeImage,
    imageAlt: "TaskGo Platform"
  };

  // Stats configuration
  const statsConfig = {
    title: "Trusted by Thousands",
    description: "Join our growing community of customers and taskers who are getting things done every day",
    stats: [
      {
        title: "Active Tasks",
        key: "liveJobs",
        icon: <FaTasks className="text-2xl text-white" />,
        color: "from-blue-500 to-blue-600",
        description: "Ready to be completed",
        fallbackValue: 0
      },
      {
        title: "Skilled Taskers",
        key: "taskers",
        icon: <FaUsers className="text-2xl text-white" />,
        color: "from-green-500 to-green-600",
        description: "Verified professionals",
        fallbackValue: 0
      },
      {
        title: "Happy Customers",
        key: "customers",
        icon: <FaThumbsUp className="text-2xl text-white" />,
        color: "from-purple-500 to-purple-600",
        description: "Satisfied users",
        fallbackValue: 0
      },
      {
        title: "Tasks Completed",
        key: "completedTasks",
        icon: <FaCheck className="text-2xl text-white" />,
        color: "from-orange-500 to-orange-600",
        description: "Successfully finished",
        fallbackValue: 0
      }
    ],
    apiEndpoint: '/stats/dashboard',
    fallbackStats: {
      liveJobs: 0,
      taskers: 0,
      customers: 0,
      completedTasks: 0
    }
  };

  // Memoize fallback categories to prevent infinite re-renders
  const fallbackCategories = useMemo(() => generateCategoriesWithMetadata(dashboardCategories), []);
  
  // Memoize the getCategoryStats function
  const getCategoryStats = taskService.useCategoryStats();

  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection {...heroConfig} />
        <StatsSection {...statsConfig} />
        <HowItWorksSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RecentReviews 
            title="What Our Community Says"
            limit={4}
            className="mb-8"
          />
        </div>
        <CategoriesGrid 
          apiEndpoint={getCategoryStats}
          fallbackCategories={fallbackCategories}
          maxCategories={4}
        />
        <WhyChooseSection />
        {!isLoggedIn && <CallToActionSection />}
      </main>
    </div>
  );
};

export default Home;
