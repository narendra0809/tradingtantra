/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive_deps */
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaUser, FaCreditCard, FaUsers } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import Pagination from "../../Components/AdminComponents/Pagination";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import { AdminSearchInput } from "../../Components/AdminComponents/AdminInput";
import StatsCard from "../../Components/AdminComponents/StatsCard";

const StatusBadge = ({ status }) => {
  const base = "px-2 py-1 rounded-md text-xs sm:text-sm font-medium";
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "expired":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "cancelled":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "N/A":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };
  return <span className={`${base} ${getStatusColor()}`}>{status}</span>;
};

const PaymentStatusBadge = ({ status }) => {
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

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
  const { transactions: allTransactions } = useOutletContext();
  const [activeTab, setActiveTab] = useState("registered"); // 'registered' or 'paid'
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sorting state
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Separate users into registered (unpaid) and paid
  const registeredUsers = allTransactions?.filter(
    (user) => user.paymentStatus === "Unpaid"
  ) || [];
  
  const paidUsers = allTransactions?.filter(
    (user) => user.paymentStatus === "Paid"
  ) || [];

  // Get current users based on active tab
  const currentUsers = activeTab === "registered" ? registeredUsers : paidUsers;

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

  // Filter and sort users
  const processedUsers = useMemo(() => {
    let result = [...currentUsers];

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((user) =>
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
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

      // Default string comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || "";
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [currentUsers, searchTerm, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(processedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = processedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats for current tab
  const totalUsers = processedUsers.length;
  const activeCount = processedUsers.filter((u) => u.subcriptionStatus === "active").length;

  // Column definitions
  const columns = [
    { key: "name", label: "User", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "paymentDate", label: "Payment Date", sortable: true },
    { key: "expiryDate", label: "Expiry Date", sortable: true },
    { key: "amount", label: "Amount", sortable: true },
    { key: "paymentStatus", label: "Payment Status", sortable: true },
    { key: "subcriptionStatus", label: "Subscription Status", sortable: true },
  ];

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AdminCard gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FaUsers className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">User Management</h2>
              <p className="text-sm text-gray-400">Manage registered and paid users</p>
            </div>
          </div>
        </AdminCard>

        {/* Tab Navigation */}
        <AdminCard>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab("registered");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "registered"
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <FaUser className="text-sm" />
                <span>Registered Users</span>
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {registeredUsers.length}
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("paid");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "paid"
                    ? "bg-green-600 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <FaCreditCard className="text-sm" />
                <span>Paid Users</span>
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {paidUsers.length}
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="w-full md:w-1/3">
              <AdminSearchInput
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                icon={<FaSearch />}
              />
            </div>
          </div>
        </AdminCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title={`Total ${activeTab === "registered" ? "Registered" : "Paid"} Users`}
            value={totalUsers}
            icon={activeTab === "registered" ? <FaUser /> : <FaCreditCard />}
            gradient={activeTab === "registered" ? "from-blue-500 to-cyan-500" : "from-green-500 to-emerald-500"}
          />
          <StatsCard
            title="Active Subscriptions"
            value={activeCount}
            icon={<FaCreditCard />}
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-400 px-2">
          Showing {paginatedUsers.length} of {processedUsers.length} users
        </div>

        {/* Mobile View - Card Layout */}
        {isMobileView ? (
          <div className="space-y-4">
            {paginatedUsers.map((user, idx) => (
              <AdminCard key={idx} padding="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-400 text-xs">{user.email}</div>
                    </div>
                  </div>
                  <PaymentStatusBadge status={user.paymentStatus} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-400">Payment Date</div>
                    <div>{user.paymentDate !== "N/A" ? user.paymentDate.split("T")[0] : "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Expiry Date</div>
                    <div>{user.expiryDate !== "N/A" ? user.expiryDate.split("T")[0] : "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Amount</div>
                    <div>{user.amount}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Status</div>
                    <StatusBadge status={user.subcriptionStatus} />
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        ) : (
          /* Desktop View - Table */
          <AdminCard padding="p-0" hoverEffect={false}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left font-semibold text-gray-300 bg-white/5">
                    {columns.map(col => (
                      <th 
                        key={col.key}
                        className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
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
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          {user.paymentDate !== "N/A" ? user.paymentDate.split("T")[0] : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          {user.expiryDate !== "N/A" ? user.expiryDate.split("T")[0] : "N/A"}
                        </td>
                        <td className="py-3 px-4">{user.amount}</td>
                        <td className="py-3 px-4">
                          <PaymentStatusBadge status={user.paymentStatus} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={user.subcriptionStatus} />
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
        )}

        {paginatedUsers.length === 0 && (
          <AdminCard>
            <div className="text-center py-8 text-gray-400">
              No {activeTab === "registered" ? "registered" : "paid"} users found
            </div>
          </AdminCard>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
