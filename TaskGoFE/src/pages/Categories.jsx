import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const categories = [
    {
      title: "Cleaning",
      tasks: "357 Open Tasks",
      image: "/images/categories/cleaning.jpg"
    },
    {
      title: "Repairing",
      tasks: "357 Open Tasks",
      image: "/images/categories/repairing.jpg"
    },
    {
      title: "Handyman",
      tasks: "357 Open Tasks",
      image: "/images/categories/handyman.jpg"
    },
    {
      title: "Maintenance",
      tasks: "357 Open Tasks",
      image: "/images/categories/maintenance.jpg"
    },
    {
      title: "Gardening",
      tasks: "357 Open Tasks",
      image: "/images/categories/gardening.jpg"
    },
    {
      title: "Landscaping",
      tasks: "357 Open Tasks",
      image: "/images/categories/landscaping.jpg"
    },
    {
      title: "Installations",
      tasks: "357 Open Tasks",
      image: "/images/categories/installations.jpg"
    },
    {
      title: "Security",
      tasks: "357 Open Tasks",
      image: "/images/categories/security.jpg"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Categories </h1>
            <div className="flex space-x-2">
              <span>Home</span>
              <span>/</span>
              <span className="text-gray-500">Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by: Tasker name, Category..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="City, state or zip code"
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2">
            <FaFilter />
            Filters
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            Find Taskers
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                <p className="text-sm text-gray-500">{category.tasks}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;