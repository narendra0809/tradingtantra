import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/AdminComponents/Sidebar";
import Topbar from "../../Components/AdminComponents/Topbar";
import MarketTicker from "../../Components/AdminComponents/MarketTicker";
import axios from "axios";
import { useEffect } from "react";

export const ADMIN_SERVER_URI = `${import.meta.env.VITE_SERVER_URI}/admin`;

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const [transactions, setTransactions] = useState([
    {
      name: "",
      email: "",
      expiryDate: "",
      subcriptionStatus: "",
      orderId: "",
      transactionId: "",
      paymentDate: "",
      paymentStatus: "Paid",
      amount: "INR 3,999",
    },
  ]);

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
      if (res.status !== 200) {
        throw new Error("Error in fetching admin details.");
      }

      setAdmin(res.data.data);
    } catch (error) {
      console.log("Error in fetching admin details : ", error);
    }
  };

  const fetchTotalUsersData = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-users`, {
        withCredentials: true,
      });
      if (res.status !== 200) {
        throw new Error("Failed to fetch users data");
      }
      setUsersData(res.data.usersData);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchActiveUsersByMonth = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-activeusers-month`, {
        withCredentials: true,
      });
      if (res.status !== 200) {
        throw new Error("Failed to fetch users data");
      }

      setActiveUsersByMonth(res.data.acitveUsersByMonth);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-transactions`, {
        withCredentials: true,
      });
      if (res.status !== 200) {
        throw new Error("Error while fetching transactions !");
      }
      setTransactions(res.data.transactions);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
    fetchTotalUsersData();
    fetchActiveUsersByMonth();
    fetchAllTransactions();
  }, []);

  return (
    <div className="flex bg-black min-h-screen relative text-white overflow-hidden">
      {" "}
      {/* Changed from overflow-x-hidden to overflow-hidden */}
      {/* Desktop Sidebar */}
      <div className="hidden md:block border-r border-gray-800 bg-[#0c0c1d]">
        <Sidebar closeSidebar={closeSidebar} />
      </div>
      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 backdrop-blur-xl bg-opacity-50 z-40"
            onClick={closeSidebar}
          />
          {/* Slide-in Sidebar */}
          <div className="fixed top-0 left-0 w-64 h-full bg-[#0c0c1d] z-50 shadow-lg">
            <Sidebar closeSidebar={closeSidebar} />
          </div>
        </>
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {" "}
        {/* Added min-w-0 */}
        <div className="sticky top-0 z-30">
          {" "}
          {/* Wrapped Topbar in sticky container */}
          <Topbar onToggleSidebar={toggleSidebar} />
          <MarketTicker />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
          {" "}
          {/* Added min-w-0 */}
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
