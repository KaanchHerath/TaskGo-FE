import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import HeroSection from "../../components/home/HeroSection";
import StatsSection from "../../components/home/StatsSection";
import CategoriesSection from "../../components/home/CategoriesSection";
import HowItWorks from "../../components/home/HowItWorks";
import TestimonialsSection from "../../components/home/TestimonialsSection";
import RegistrationCTA from "../../components/home/RegistrationCTA";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection />
        <StatsSection />
        <CategoriesSection />
        <HowItWorks />
        <TestimonialsSection />
        {!isLoggedIn && <RegistrationCTA />}
      </main>
    </div>
  );
};

export default Home;
