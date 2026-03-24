import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import LatestTransactions from "./LatestTransactions";
import Card from "../../Components/AdminComponents/Card";

import totalUserIcon from "../../assets/adminImages/icon1.png";
import activeUserIcon from "../../assets/adminImages/icon2.png";
import totalAmountIcon from "../../assets/adminImages/icon3.png";
import { useOutletContext } from "react-router-dom"; 
import { FaCalendarAlt, FaFilter, FaSyncAlt, FaChevronDown, FaChevronUp, FaChartBar, FaChartPie, FaTable, FaTachometerAlt } from "react-icons/fa";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput from "../../Components/AdminComponents/AdminInput";

// Lazy load chart components for better performance
const StatsChart = lazy(() => import("../../Components/AdminComponents/StatsChart"));
const MonthlyBarChart = lazy(() => import("../../Components/AdminComponents/MonthlyBarChart"));
const StatusByProcessChart = lazy(() => import("../../Components/AdminComponents/StatusByProcessChart"));

const initialStatData = [
  { icon: totalUserIcon, value: 0, title: "Total Users" },
  { icon: activeUserIcon, value: 0, title: "Total Active User" },
  { icon: totalAmountIcon, value: 0, title: "Total Amount" },
];

// Loading skeleton for charts
const ChartSkeleton = ({ height = "h-[400px]" }) => (
  <div className={`${height} bg-white/5 rounded-lg animate-pulse flex items-center justify-center`}>
    <div className="text-gray-500">Loading chart...</div>
  </div>
);

// Collapsible section component
const CollapsibleSection = ({ title, icon: Icon, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <AdminCard>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-lg sm:text-xl font-semibold mb-4"
      >
        <div className="flex items-center gap-2">
          <Icon className="text-blue-400" />
          <span>{title}</span>
        </div>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isOpen && children}
    </AdminCard>
  );
};

const Dashboard = () => {
  const { usersData, activeUsersByMonth, transactions } = useOutletContext();
  const [statData, setStatData] = useState(initialStatData);
  
  // Section visibility state
  const [sections, setSections] = useState({
    stats: true,
    salesFilter: false,
    charts: true,
    monthlyChart: true,
    transactions: true,
  });
  
  // Loading state for refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sales filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredSales, setFilteredSales] = useState({
    totalAmount: 0,
    totalTransactions: 0
  });
  const [showSalesFilter, setShowSalesFilter] = useState(false);

  // Optimized stat data update with useMemo
  useEffect(() => {
    if (usersData) {
      setStatData((stats) =>
        stats.map((stat) => {
          if (stat.title === "Total Users") {
            stat.value = usersData.totalUsers;
          } else if (stat.title === "Total Active User") {
            stat.value = usersData.activeUsers;
          } else {
            stat.value = usersData.totalAmount;
          }
          return stat;
        })
      );
    }
  }, [usersData]);

  // Optimized sales calculation with useMemo
  const salesData = useMemo(() => {
    if (!transactions) return { totalAmount: 0, totalTransactions: 0 };
    
    const filtered = transactions.filter((tx) => {
      if (tx.paymentStatus !== "Paid") return false;
      
      const paymentDate = tx.paymentDate;
      if (!paymentDate || paymentDate === "N/A") return false;
      
      const txDate = new Date(paymentDate.split("T")[0]);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      
      if (from && txDate < from) return false;
      if (to && txDate > to) return false;
      
      return true;
    });
    
    const total = filtered.reduce((sum, tx) => {
      const amountStr = tx.amount?.toString().replace(/[^0-9.]/g, "") || "0";
      return sum + (parseFloat(amountStr) || 0);
    }, 0);
    
    return {
      totalAmount: total,
      totalTransactions: filtered.length
    };
  }, [transactions, fromDate, toDate]);

  // Update filtered sales when data changes
  useEffect(() => {
    setFilteredSales(salesData);
  }, [salesData]);

  const handleFilterClick = () => {
    setShowSalesFilter(false);
  };
  
  const handleResetFilter = () => {
    setFromDate("");
    setToDate("");
  };

  // Toggle section visibility
  const toggleSection = (section) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Manual refresh (could trigger API call in real implementation)
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with refresh button */}
        <AdminCard gradient>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FaTachometerAlt className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
                <p className="text-sm text-gray-400">Overview and analytics</p>
              </div>
            </div>
            <AdminButton
              variant="primary"
              icon={<FaSyncAlt className={isRefreshing ? "animate-spin" : ""} />}
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </AdminButton>
          </div>
        </AdminCard>

        {/* Stats Cards */}
        <CollapsibleSection
          title="Overview"
          icon={FaChartBar}
          defaultOpen={sections.stats}
        >
          <div onClick={() => toggleSection('stats')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {statData?.map((item, idx) => (
                <Card
                  key={idx}
                  number={item?.value}
                  img={item?.icon}
                  text={item?.title}
                />
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* Sales Filter Section */}
        <AdminCard>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <button
              onClick={() => {
                setShowSalesFilter(!showSalesFilter);
                toggleSection('salesFilter');
              }}
              className="flex items-center gap-2 text-lg sm:text-xl font-semibold"
            >
              <FaFilter className="text-blue-400" />
              <span>Sales Filter</span>
              {(fromDate || toDate) && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">Active</span>
              )}
            </button>
            <div className="flex gap-2">
              {(fromDate || toDate) && (
                <AdminButton variant="secondary" size="sm" onClick={handleResetFilter}>
                  Clear Filter
                </AdminButton>
              )}
              <AdminButton 
                variant="primary" 
                size="sm"
                icon={<FaFilter className="text-sm" />}
                onClick={() => setShowSalesFilter(!showSalesFilter)}
              >
                {showSalesFilter ? "Hide" : "Filter"}
              </AdminButton>
            </div>
          </div>
          
          {showSalesFilter && (
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <AdminInput
                  type="date"
                  label="From Date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="flex-1 w-full">
                <AdminInput
                  type="date"
                  label="To Date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <AdminButton variant="success" onClick={handleFilterClick}>
                  Apply Filter
                </AdminButton>
                <AdminButton variant="secondary" onClick={handleResetFilter}>
                  Reset
                </AdminButton>
              </div>
            </div>
          )}
          
          {/* Filtered Results - Always visible when filter is active */}
          {(fromDate || toDate) && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Filtered Sales Amount</div>
                  <div className="text-2xl font-bold text-green-400">
                    ₹{filteredSales.totalAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Filtered Transactions</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {filteredSales.totalTransactions}
                  </div>
                </div>
              </div>
            </div>
          )}
        </AdminCard>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CollapsibleSection
            title="User Statistics"
            icon={FaChartBar}
            defaultOpen={sections.charts}
          >
            <div onClick={() => toggleSection('charts')}>
              <Suspense fallback={<ChartSkeleton height="h-[400px]" />}>
                <div className="w-full h-[400px]">
                  <StatsChart statData={usersData} />
                </div>
              </Suspense>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Status By Process"
            icon={FaChartPie}
            defaultOpen={sections.charts}
          >
            <div onClick={() => toggleSection('charts')}>
              <Suspense fallback={<ChartSkeleton height="h-[350px]" />}>
                <div className="w-full h-[300px] sm:h-[350px]">
                  <StatusByProcessChart statData={usersData} />
                </div>
              </Suspense>
            </div>
          </CollapsibleSection>
        </div>

        {/* Monthly Bar Chart */}
        <CollapsibleSection
          title="Monthly Users"
          icon={FaChartBar}
          defaultOpen={sections.monthlyChart}
        >
          <div onClick={() => toggleSection('monthlyChart')}>
            <Suspense fallback={<ChartSkeleton height="h-[300px]" />}>
              <div className="w-full overflow-x-auto">
                <MonthlyBarChart activeUsersByMonth={activeUsersByMonth} />
              </div>
            </Suspense>
          </div>
        </CollapsibleSection>

        {/* Latest Transactions */}
        <CollapsibleSection
          title="Recent Transactions"
          icon={FaTable}
          defaultOpen={sections.transactions}
        >
          <div onClick={() => toggleSection('transactions')}>
            <LatestTransactions transactions={transactions} />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default Dashboard;
