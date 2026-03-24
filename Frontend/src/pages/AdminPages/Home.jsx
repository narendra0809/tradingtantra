/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/AdminComponents/Sidebar";
import Topbar from "../../Components/AdminComponents/Topbar";
import UpdateNotification from "../../Components/AdminComponents/UpdateNotification";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { TickerTape } from "react-ts-tradingview-widgets";

export const ADMIN_SERVER_URI = `${import.meta.env.VITE_SERVER_URI}/admin`;

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickers, setTickers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  
  const [usersData, setUsersData] = useState({
    activeUsers: 0,
    inActiveUsers: 0,
    totalAmount: 0,
    totalUsers: 0,
  });

  const [transactions, setTransactions] = useState([]);

  const [activeUsersByMonth, setActiveUsersByMonth] = useState([
    { name: "January", value: 0 },
    { name: "February", value: 0 },
    { name: "March", value: 0 },
    { name: "April", value: 0 },
    { name: "May", value: 0 },
    { name: "June", value: 0 },
    { name: "July", value: 0 },
    { name: "August", value: 0 },
    { name: "September", value: 0 },
    { name: "October", value: 0 },
    { name: "November", value: 0 },
    { name: "December", value: 0 },
  ]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const fetchAdminDetails = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-admin`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setAdmin(res.data.data);
      }
    } catch (error) {
      console.log("Error in fetching admin details : ", error);
    }
  };

  const fetchTickers = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-tickers`);
      setTickers(res.data?.tickers || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTotalUsersData = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-users`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setUsersData(res.data.usersData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchActiveUsersByMonth = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-activeusers-month`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setActiveUsersByMonth(res.data.acitveUsersByMonth);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-transactions`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setTransactions(res.data.transactions);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all data - don't block UI
    fetchAdminDetails();
    fetchTotalUsersData();
    fetchActiveUsersByMonth();
    fetchAllTransactions();
    fetchTickers();
  }, []);

  // Show loading only on initial load
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-[#050816] to-[#0a101f] text-white">
        <Toaster />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#050816] to-[#0a101f] text-white">
      {/* Desktop Sidebar - Sticky on md and above */}
      <div className="hidden md:block md:sticky md:top-0 md:h-screen">
        <Sidebar closeSidebar={closeSidebar} />
      </div>

      <Toaster />
      <UpdateNotification />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={closeSidebar}
          />
          {/* Slide-in Sidebar */}
          <div className="fixed top-0 left-0 w-72 h-full z-50 md:hidden animate-slide-in">
            <Sidebar closeSidebar={closeSidebar} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Topbar */}
        <div className="sticky top-0 z-30">
          <Topbar onToggleSidebar={toggleSidebar} />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet
            context={{
              admin: admin,
              usersData: usersData,
              activeUsersByMonth: activeUsersByMonth,
              transactions: transactions,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default Home;
