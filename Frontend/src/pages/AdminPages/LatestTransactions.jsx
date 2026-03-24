/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { FiDollarSign, FiSearch } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import Pagination from "../../Components/AdminComponents/Pagination";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import { AdminSearchInput } from "../../Components/AdminComponents/AdminInput";
import AdminInput from "../../Components/AdminComponents/AdminInput";

const StatusButton = ({ status }) => (
  <span
    className={`px-3 py-1 text-xs rounded-md font-medium ${
      status === "Paid" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
    }`}
  >
    {status}
  </span>
);

const ITEMS_PER_PAGE = 10;

const LatestTransactions = ({ transactions }) => {
  const { transactions: allTransactions } = useOutletContext();
  
  if (!transactions) {
    transactions = allTransactions;
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sorting state
  const [sortField, setSortField] = useState("paymentDate");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Filter state
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  // Filter and sort transactions
  const processedTransactions = useMemo(() => {
    let result = [...(transactions || [])];

    // Filter by date
    if (selectedDate) {
      result = result.filter((tx) => 
        tx.paymentDate.split("T")[0] === selectedDate
      );
    }

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((tx) =>
        tx.name?.toLowerCase().includes(search) ||
        tx.email?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle date fields
      if (sortField === 'paymentDate' || sortField === 'expiryDate') {
        aVal = aVal !== "N/A" ? new Date(aVal) : new Date(0);
        bVal = bVal !== "N/A" ? new Date(bVal) : new Date(0);
      }

      // Handle amount - extract numeric value
      if (sortField === 'amount') {
        aVal = parseFloat(aVal?.toString().replace(/[^0-9.]/g, "")) || 0;
        bVal = parseFloat(bVal?.toString().replace(/[^0-9.]/g, "")) || 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, selectedDate, searchTerm, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(processedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = processedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Column definitions for sorting
  const columns = [
    { key: "name", label: "Name & Email", sortable: true },
    { key: "paymentDate", label: "Payment Date", sortable: true },
    { key: "expiryDate", label: "Expiry Date", sortable: true },
    { key: "amount", label: "Amount", sortable: true },
    { key: "paymentStatus", label: "Status", sortable: true },
  ];

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AdminCard gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <FiDollarSign className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Latest Transactions</h2>
              <p className="text-sm text-gray-400">View and manage payment transactions</p>
            </div>
          </div>
        </AdminCard>

        {/* Filters */}
        <AdminCard>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Date Filter */}
            <div className="w-full md:w-1/3">
              <AdminInput
                type="date"
                label="Filter by Date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Search Filter */}
            <div className="w-full md:w-2/3">
              <AdminSearchInput
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                icon={<FiSearch />}
              />
            </div>
          </div>
        </AdminCard>

        {/* Results count */}
        <div className="text-sm text-gray-400 px-2">
          Showing {paginatedTransactions.length} of {processedTransactions.length} transactions
        </div>

        {/* Table */}
        <AdminCard padding="p-0" hoverEffect={false}>
          <div className="w-full overflow-x-auto">
            <table className="min-w-[650px] w-full">
              <thead>
                <tr className="text-left text-sm font-semibold text-gray-300 bg-white/5">
                  <th className="py-3 px-4 w-10">
                    <input type="checkbox" className="rounded" />
                  </th>
                  {columns.map(col => (
                    <th 
                      key={col.key}
                      className={`py-3 px-4 cursor-pointer hover:text-white transition-colors ${col.sortable !== false ? '' : 'cursor-default'}`}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortField === col.key && (
                          <span className="text-blue-400">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx, idx) => (
                    <tr
                      key={idx}
                      className="text-sm border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{tx.name}</div>
                          <div className="text-gray-400 text-xs">{tx.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {tx.paymentDate !== "N/A" ? tx.paymentDate.split("T")[0] : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {tx.expiryDate !== "N/A" ? tx.expiryDate.split("T")[0] : "N/A"}
                      </td>
                      <td className="py-3 px-4">{tx.amount}</td>
                      <td className="py-3 px-4">
                        <StatusButton status={tx.paymentStatus} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-white/5 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                columns={columns}
              />
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
};

export default LatestTransactions;
