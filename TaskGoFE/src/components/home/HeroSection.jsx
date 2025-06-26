import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import homeImage from '../../assets/homeimage.png';

const Hero = () => {
  return (
    <>
    <div style={{paddingLeft: '180px', paddingRight: '100px'}}>

    
      <section className="flex flex-col md:flex-row items-center justify-between py-16 px-4 md:px-24 bg-#f7f7f8">
        {/* Left side content */}
        <div className="w-full md:w-1/2 text-left mb-10 md:mb-0 pr-0 md:pr-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 leading-tight">
            Find Tasks and<br />Start Earning Today
          </h1>
          <p className="text-gray-600 mb-8 max-w-lg">
            Aliqam vitae turpis in diam convallis finibus in at risus. Nullam<br />
            in scelerisque leo, eget sollicitudin velit vestibulum.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="border border-gray-300 px-10 py-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task title, Keyword..."
              />
            </div>
            <div className="relative flex-grow">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="border border-gray-300 px-10 py-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Location"
              />
            </div>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
              Find Tasks
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <span>Suggestion: </span>
            <span>Plumber, </span>
            <span>Gardener, </span>
            <span className="text-blue-500">Cleaner, </span>
            <span>Repair, </span>
            <span>Maintainer.</span>
          </div>
        </div>
        
        {/* Right side image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <img 
            src={homeImage} 
            alt="Person working on laptop" 
            className="max-w-full h-auto"
          />
        </div>
      </section>

      </div>
    </>
  );
};

export default Hero;
