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
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
    fetchTotalUsersData();
  }, []);

  return (
    <div className="flex bg-black min-h-screen relative text-white overflow-x-hidden">
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
          <div
            className={`${
              !sidebarOpen && "hidden"
            } fixed top-0 left-0 w-64 h-full bg-[#0c0c1d] z-50 shadow-lg`}
          >
            <Sidebar closeSidebar={closeSidebar} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar onToggleSidebar={toggleSidebar} />
        <MarketTicker />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet
            context={{
              admin: admin,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default Home;
