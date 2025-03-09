import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const Services = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Our Services
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Discover what we can do for you
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
              <p className="mt-4 text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const services = [
  {
    title: "Home Services",
    description: "Professional cleaning, repairs, and maintenance for your home.",
  },
  {
    title: "Professional Tasks",
    description: "Business services, consulting, and professional assistance.",
  },
  {
    title: "Personal Assistant",
    description: "Help with daily tasks, errands, and personal organization.",
  },
  {
    title: "Technical Support",
    description: "IT services, software help, and technical troubleshooting.",
  },
  {
    title: "Creative Services",
    description: "Design, content creation, and artistic projects.",
  },
  {
    title: "Event Planning",
    description: "Organization and coordination of events and celebrations.",
  },
];

export default Services;