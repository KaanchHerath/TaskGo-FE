const CategoryCard = ({ title, openTasks }) => {
    return (
      <div className="bg-white shadow p-4 rounded-lg w-48">
        <h3 className="font-bold">{title}</h3>
        <p className="text-gray-500">{openTasks} Open Tasks</p>
      </div>
    );
  };
  
  export default CategoryCard;
  