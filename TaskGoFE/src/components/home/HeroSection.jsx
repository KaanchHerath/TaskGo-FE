import { FaSearch } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="text-center py-16 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">
        Find a Tasker that gets your tasks done.
      </h1>
      <p className="text-gray-600 mb-6">
        Search for the best professionals to help with your tasks.
      </p>
      <div className="flex justify-center gap-4">
        <input
          type="text"
          className="border px-4 py-2 w-64 rounded-lg"
          placeholder="Task title, Keyword..."
        />
        <input
          type="text"
          className="border px-4 py-2 w-48 rounded-lg"
          placeholder="Your Location"
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center">
          <FaSearch className="mr-2" /> Find Tasker
        </button>
      </div>
    </section>
  );
};

export default Hero;
