import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import CategoriesSection from "../components/home/CategoriesSection";
import HowItWorks from "../components/home/HowItWorks";
import RegistrationCTA from "../components/home/RegistrationCTA";
import TestimonialsSection from "../components/home/TestimonialsSection";
import Footer from "../components/layout/Footer";

const Home = () => {
  return (
    <>
      <div className="min-h-screen bg-white">
        <main>
          <HeroSection />
          <StatsSection />
          <CategoriesSection />
          <HowItWorks />
          <RegistrationCTA />
          <TestimonialsSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
