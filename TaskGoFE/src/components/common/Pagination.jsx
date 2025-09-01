import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  maxVisiblePages = 5 
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Previous button
  if (currentPage > 1) {
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all backdrop-blur-sm flex items-center"
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-4 py-2 rounded-xl transition-all backdrop-blur-sm ${
          i === currentPage
            ? 'bg-blue-500/80 text-white shadow-lg shadow-blue-500/25'
            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
        }`}
      >
        {i}
      </button>
    );
  }

  // Next button
  if (currentPage < totalPages) {
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all backdrop-blur-sm flex items-center"
      >
        <FaChevronRight className="w-4 h-4" />
      </button>
    );
  }

  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between mt-8 p-6 bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl">
      <div className="text-sm text-slate-700 font-medium">
        Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalItems}</span> results
      </div>
      <div className="flex items-center space-x-2">
        {pages}
      </div>
    </div>
  );
};

export default Pagination; 