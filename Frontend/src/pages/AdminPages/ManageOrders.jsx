/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect } from "react";
import { FaSearch, FaRegFilePdf } from "react-icons/fa";
import { FiShoppingCart, FiSearch, FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useOutletContext } from "react-router-dom";
import Pagination from "../../Components/AdminComponents/Pagination";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import { AdminSearchInput } from "../../Components/AdminComponents/AdminInput";
import AdminInput from "../../Components/AdminComponents/AdminInput";

const PaymentBadge = ({ status }) => {
  const base = "px-2 py-1 rounded-md text-xs sm:text-sm font-medium";
  return (
    <span
      className={`${base} ${
        status === "Paid" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
      }`}
    >
      {status}
    </span>
  );
};

const OrderStatusBadge = ({ status }) => {
  const base = "px-2 py-1 rounded-md text-xs sm:text-sm font-medium";
  const colorClass =
    status === "Complete"
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : status === "Cancelled"
      ? "bg-red-500/20 text-red-400 border border-red-500/30"
      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  return <span className={`${base} ${colorClass}`}>{status}</span>;
};

const ITEMS_PER_PAGE = 10;

const ManageOrders = () => {
  const { transactions: orders } = useOutletContext();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sorting state
  const [sortField, setSortField] = useState("paymentDate");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Filter state
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter and sort orders
  const processedOrders = useMemo(() => {
    let result = [...(orders || [])];

    // Filter by date
    if (selectedDate) {
      result = result.filter((item) => 
        item.paymentDate.split("T")[0] === selectedDate
      );
    }

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((item) =>
        item.name?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        item.orderId?.toLowerCase().includes(search)
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
  }, [orders, selectedDate, searchTerm, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(processedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = processedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Column definitions
  const columns = [
    { key: "name", label: "Name & Email", sortable: true },
    { key: "paymentDate", label: "Payment Date", sortable: true },
    { key: "expiryDate", label: "Expiry Date", sortable: true },
    { key: "orderId", label: "Order ID", sortable: true },
    { key: "transactionId", label: "Transaction ID", sortable: true },
    { key: "amount", label: "Amount", sortable: true },
    { key: "paymentStatus", label: "Payment", sortable: true },
    { key: "subcriptionStatus", label: "Status", sortable: true },
  ];

  // Initialize mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const downloadInvoice = (order) => {
    const worksheet = XLSX.utils.json_to_sheet([order]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, `${order.name}_Invoice.xlsx`);
  };

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AdminCard gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <FiShoppingCart className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Manage Orders</h2>
              <p className="text-sm text-gray-400">View and manage user orders</p>
            </div>
          </div>
        </AdminCard>

        {/* Filters */}
        <AdminCard>
          <div className="flex flex-col md:flex-row gap-4">
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

            <div className="w-full md:w-2/3">
              <AdminSearchInput
                placeholder="Search by name, email or order ID..."
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
          Showing {paginatedOrders.length} of {processedOrders.length} orders
        </div>

        {/* Mobile View - Card Layout */}
        <div className="lg:hidden space-y-4">
          {paginatedOrders.map((item, idx) => (
            <AdminCard key={idx} padding="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-400 text-xs">{item.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{item.paymentDate}</div>
                  <div className="text-xs text-gray-400">{item.amount}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <div className="text-gray-400">Order ID</div>
                  <div className="truncate">{item.orderId}</div>
                </div>
                <div>
                  <div className="text-gray-400">Transaction ID</div>
                  <div className="truncate">{item.transactionId}</div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <PaymentBadge status={item.paymentStatus} />
                  <OrderStatusBadge status={item.subscriptionStatus} />
                </div>
                <AdminButton 
                  variant="outline" 
                  size="sm"
                  icon={<FiDownload />}
                  onClick={() => downloadInvoice(item)}
                >
                  Invoice
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block">
          <AdminCard padding="p-0" hoverEffect={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left font-semibold text-gray-300 bg-white/5">
                    {columns.map(col => (
                      <th 
                        key={col.key}
                        className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort(col.key)}
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
                    <th className="py-3 px-4 whitespace-nowrap">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-400 text-xs">
                              {item.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.paymentDate !== "N/A" ? item.paymentDate.split("T")[0] : "N/A"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.expiryDate !== "N/A" ? item.expiryDate.split("T")[0] : "N/A"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.orderId}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.transactionId}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.amount}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <PaymentBadge status={item.paymentStatus} />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <OrderStatusBadge status={item.subcriptionStatus} />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <AdminButton 
                            variant="outline" 
                            size="sm"
                            icon={<FiDownload />}
                            onClick={() => downloadInvoice(item)}
                          >
                            Download
                          </AdminButton>
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

        {paginatedOrders.length === 0 && (
          <AdminCard>
            <div className="text-center py-8 text-gray-400">
              No orders found matching your criteria
            </div>
          </AdminCard>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
