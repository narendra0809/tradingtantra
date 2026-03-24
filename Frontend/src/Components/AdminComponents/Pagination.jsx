/* eslint-disable react/prop-types */
import { FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  sortField, 
  sortDirection, 
  onSort,
  columns = []
}) => {
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-500 ml-1" />;
    return sortDirection === 'asc' 
      ? <FaSortUp className="text-blue-400 ml-1" /> 
      : <FaSortDown className="text-blue-400 ml-1" />;
  };

  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const renderSortableHeader = (column) => (
    <th 
      key={column.key}
      className={`py-3 px-2 ${column.sortable !== false ? 'cursor-pointer hover:text-blue-400' : ''}`}
      onClick={() => column.sortable !== false && handleSort(column.key)}
    >
      <div className="flex items-center">
        {column.label}
        {column.sortable !== false && getSortIcon(column.key)}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      {/* Sort columns if provided */}
      {columns.length > 0 && (
        <div className="text-sm text-gray-400">
          Sort by: <span className="text-white">{sortField || 'None'}</span>
          {' '}({sortDirection === 'asc' ? 'ASC' : 'DESC'})
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 mr-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-[#101B35] text-white hover:bg-blue-600'
          }`}
        >
          <FaChevronLeft />
        </button>
        
        {/* Page numbers */}
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-lg transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#101B35] text-white hover:bg-blue-600'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-[#101B35] text-white hover:bg-blue-600'
          }`}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
