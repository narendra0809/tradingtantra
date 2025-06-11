import LatestTransactions from "./LatestTransactions";
import Card from "../../Components/AdminComponents/Card";
import StatsChart from "../../Components/AdminComponents/StatsChart";
import MonthlyBarChart from "../../Components/AdminComponents/MonthlyBarChart";
import StatusByProcessChart from "../../Components/AdminComponents/StatusByProcessChart";

import totalUserIcon from "../../assets/adminImages/icon1.png";
import activeUserIcon from "../../assets/adminImages/icon2.png";
import totalAmountIcon from "../../assets/adminImages/icon3.png";

const statData = [
  { icon: totalUserIcon, value: "100", title: "Total Users" },
  { icon: activeUserIcon, value: "20", title: "Total Active User" },
  { icon: totalAmountIcon, value: "160,000", title: "Total Amount" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0a101f] px-4 sm:px-6 md:px-10 lg:px-14 py-6 text-white font-sans">
      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 tracking-wide select-none text-start md:text-center">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statData.map((item, idx) => (
          <Card
            key={idx}
            number={item.value}
            img={item.icon}
            text={item.title}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <section
          aria-labelledby="bar-chart-title"
          className="bg-[#0f172a] p-4 rounded-xl shadow-md"
        >
          <h2
            id="bar-chart-title"
            className="text-lg sm:text-xl font-semibold mb-4 tracking-wide select-none text-center"
          >
            Monthly Sales
          </h2>
          <div className="w-full h-64 sm:h-72 md:h-80">
            <StatsChart />
          </div>
        </section>

        {/* Donut Chart */}
        <section
          aria-labelledby="donut-chart-title"
          className="bg-[#0f172a] p-4 rounded-xl shadow-md"
        >
          <h2
            id="donut-chart-title"
            className="text-lg sm:text-xl font-semibold mb-4 tracking-wide select-none text-center"
          >
            Status By Process
          </h2>
          <div className="w-full h-64 sm:h-72 md:h-80">
            <StatusByProcessChart />
          </div>
        </section>
      </div>

      {/* Monthly Bar Chart */}
      <div className="mt-10 bg-[#0f172a] p-4 rounded-xl shadow-md w-full overflow-x-auto">
        <MonthlyBarChart />
      </div>

      {/* Latest Transactions */}
      <div className="mt-10">
        <LatestTransactions />
      </div>
    </div>
  );
};

export default Dashboard;
