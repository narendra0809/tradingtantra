import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Images/logo.svg";
import { checkMaintenanceMode } from "../../utils/checkMaintenance";

const MaintenancePage = () => {
  const navigate = useNavigate();
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We are under maintenance. Please check back soon."
  );

  useEffect(() => {
    // Fetch maintenance message from API
    const fetchMaintenanceStatus = async () => {
      try {
        const { isMaintenance, message } = await checkMaintenanceMode();
        
        // If maintenance is OFF, redirect to home
        if (!isMaintenance) {
          navigate("/", { replace: true });
          return;
        }
        
        if (message) {
          setMaintenanceMessage(message);
        }
      } catch (error) {
        console.error("Error fetching maintenance status:", error);
        // Keep default message on error
      }
    };

    fetchMaintenanceStatus();
    
    // Check every 10 seconds if maintenance is still ON
    const interval = setInterval(() => {
      fetchMaintenanceStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02000E] via-[#01071C] to-[#000517] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="max-w-2xl w-full text-center space-y-8 sm:space-y-10 md:space-y-12">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={logo}
            alt="Trading Tantra Logo"
            className="w-48 sm:w-56 md:w-64 h-auto"
          />
        </div>

        {/* Website Name */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Trading Tantra
          </h1>
          <div className="h-1 w-24 sm:w-32 md:w-40 mx-auto bg-gradient-to-r from-transparent via-[#0256F5] to-transparent"></div>
        </div>

        {/* Maintenance Message */}
        <div className="space-y-4 sm:space-y-6">
          <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-[#0256F533] border border-[#0A7CFF33] rounded-full backdrop-blur-lg">
            <p className="text-[#0256F5] text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wider">
              Under Maintenance
            </p>
          </div>
          
          <p className="text-white/80 text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed max-w-xl mx-auto">
            {maintenanceMessage}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 pt-4">
          <div className="w-2 h-2 bg-[#0256F5] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[#0256F5] rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-[#0256F5] rounded-full animate-pulse delay-150"></div>
        </div>
      </div>

      {/* Background decorative circles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#0256F5]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#74A4FE]/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default MaintenancePage;

