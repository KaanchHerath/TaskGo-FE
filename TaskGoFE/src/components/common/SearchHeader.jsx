import { FaSearch } from 'react-icons/fa';

const SearchHeader = ({ title, subtitle, icon: Icon = FaSearch }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50/20 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500/80 to-indigo-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md shadow-blue-500/25">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight">
                {title}
              </h1>
              <p className="text-slate-500 text-xs leading-tight">{subtitle}</p>
            </div>
          </div>
          <nav className="text-xs text-slate-500 hidden md:block">
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Home</span>
            <span className="mx-1">/</span>
            <span className="text-slate-800 font-medium">{title.split(' ')[1] || title}</span>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader; 