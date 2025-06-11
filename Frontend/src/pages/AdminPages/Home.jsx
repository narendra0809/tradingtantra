import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/AdminComponents/Sidebar";
import Topbar from "../../Components/AdminComponents/Topbar";
import MarketTicker from "../../Components/AdminComponents/MarketTicker";

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Home;
