import CategoryCard from "./CategoryCard";
import { FaTools, FaWrench, FaBroom, FaCog, FaPlug, FaHammer, FaLeaf, FaTree } from 'react-icons/fa';

const categories = [
  { title: "Home Maintenance", openTasks: 357 },
  { title: "Repairs", openTasks: 312 },
  { title: "Cleaning Services", openTasks: 287 },
  { title: "Appliance Repair", openTasks: 247 },
  { title: "Installations", openTasks: 204 },
  { title: "Handyman Services", openTasks: 167 },
  { title: "Gardening", openTasks: 125 },
  { title: "Landscaping", openTasks: 57 },
];

const CategoriesSection = () => {
  const categories = [
    { title: "Home Maintenance", tasks: "357 Open Tasks", icon: <FaTools className="w-6 h-6" /> },
    { title: "Repairs", tasks: "312 Open Tasks", icon: <FaWrench className="w-6 h-6" /> },
    { title: "Cleaning Services", tasks: "281 Open Tasks", icon: <FaBroom className="w-6 h-6" /> },
    { title: "Appliance Repair", tasks: "247 Open Tasks", icon: <FaCog className="w-6 h-6" /> },
    { title: "Installations", tasks: "204 Open Tasks", icon: <FaPlug className="w-6 h-6" /> },
    { title: "Handyman Services", tasks: "187 Open Tasks", icon: <FaHammer className="w-6 h-6" /> },
    { title: "Gardening", tasks: "125 Open Tasks", icon: <FaLeaf className="w-6 h-6" /> },
    { title: "Landscaping", tasks: "52 Open Tasks", icon: <FaTree className="w-6 h-6" /> },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Popular category</h2>
        <a href="#" className="text-blue-600 flex items-center">
          View All
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-blue-600 mb-4">
              {category.icon}
            </div>
            <h3 className="font-semibold mb-2">{category.title}</h3>
            <p className="text-sm text-gray-600">{category.tasks}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
