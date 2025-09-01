import { FaTools, FaWrench, FaBroom, FaCog, FaPlug, FaHammer, FaLeaf, FaTree } from 'react-icons/fa';

export const categoryMetadata = {
  'Cleaning': { 
    title: "Cleaning Services", 
    icon: FaBroom, 
    color: "from-purple-500 to-purple-600",
    skills: ["Cleaner", "Housekeeper", "Janitor", "Maid"]
  },
  'Repairing': { 
    title: "Repairs", 
    icon: FaWrench, 
    color: "from-green-500 to-green-600",
    skills: ["Repair Technician", "Appliance Repair", "Electronics Repair", "Device Repair"]
  },
  'Handyman': { 
    title: "Handyman Services", 
    icon: FaHammer, 
    color: "from-indigo-500 to-indigo-600",
    skills: ["Handyman", "General Maintenance", "Furniture Assembly", "Fixture Installation"]
  },
  'Maintenance': { 
    title: "Home Maintenance", 
    icon: FaTools, 
    color: "from-blue-500 to-blue-600",
    skills: ["Maintainer", "HVAC Technician", "Plumber", "Electrician"]
  },
  'Gardening': { 
    title: "Gardening", 
    icon: FaLeaf, 
    color: "from-emerald-500 to-emerald-600",
    skills: ["Gardener", "Plant Care", "Lawn Care", "Horticulturist"]
  },
  'Landscaping': { 
    title: "Landscaping", 
    icon: FaTree, 
    color: "from-teal-500 to-teal-600",
    skills: ["Landscaper", "Landscape Designer", "Outdoor Lighting", "Irrigation Specialist"]
  },
  'Installations': { 
    title: "Installations", 
    icon: FaPlug, 
    color: "from-red-500 to-red-600",
    skills: ["Installer", "Electrician", "Plumber", "Network Installer"]
  },
  'Security': { 
    title: "Security Services", 
    icon: FaCog, 
    color: "from-orange-500 to-orange-600",
    skills: ["Security Guard", "CCTV Installer", "Alarm Technician", "Locksmith"]
  }
};

export const defaultCategories = ['Cleaning', 'Repairing', 'Handyman', 'Maintenance', 'Gardening', 'Landscaping', 'Installations', 'Security'];

// Dashboard subset (first 4)
export const dashboardCategories = defaultCategories.slice(0, 4);

export const generateCategoriesWithMetadata = (categoryStats = [], fallbackCount = () => Math.floor(Math.random() * 200) + 50) => {
  return defaultCategories.map(categoryName => {
    const categoryData = categoryStats.find(cat => cat.category === categoryName);
    const count = categoryData ? categoryData.count : fallbackCount();
    const metadata = categoryMetadata[categoryName];
    
    return {
      title: metadata.title,
      tasks: `${count} Open Tasks`,
      count: count,
      icon: metadata.icon,
      color: metadata.color
    };
  });
}; 