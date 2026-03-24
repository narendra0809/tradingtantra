/* eslint-disable react/prop-types */
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

// Enhanced Table Component with modern design, sticky headers, and responsive support
const AdminTable = ({ 
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = "No data available",
  sortable = true,
  sortField,
  sortDirection,
  onSort,
  striped = true,
  hoverEffect = true,
}) => {
  const handleSort = (field) => {
    if (sortable && onSort) {
      onSort(field);
    }
  };

  const getSortIcon = (field) => {
    if (!sortable || !onSort) return null;
    if (sortField !== field) return <FaSort className="text-gray-500 ml-1 inline" />;
    return sortDirection === 'asc' 
      ? <FaSortUp className="text-blue-400 ml-1 inline" /> 
      : <FaSortDown className="text-blue-400 ml-1 inline" />;
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/5 shadow-lg">
      <table className="w-full min-w-[600px] lg:min-w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th 
                key={idx}
                className={`
                  px-4 py-4 sticky top-0 bg-[#0f172a] z-10
                  ${col.sortable !== false ? 'cursor-pointer hover:text-white hover:bg-white/5 transition-all duration-200' : ''}
                `}
                onClick={() => col.sortable !== false && handleSort(col.key)}
              >
                <div className="flex items-center">
                  {col.label}
                  {getSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-white/5 ${striped ? 'divide-dashed' : ''}`}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="text-3xl">📭</span>
                  </div>
                  <p className="text-gray-400 font-medium">{emptyMessage}</p>
                  <p className="text-gray-500 text-sm mt-1">No records found</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr 
                key={rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  transition-all duration-200
                  ${hoverEffect ? 'hover:bg-blue-500/10 hover:translate-x-1' : ''}
                  ${striped && rowIdx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-4 text-gray-300">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
