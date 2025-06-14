import LatestTransactions from "./LatestTransactions";
import Card from "../../Components/AdminComponents/Card";
import StatsChart from "../../Components/AdminComponents/StatsChart";
import MonthlyBarChart from "../../Components/AdminComponents/MonthlyBarChart";
import StatusByProcessChart from "../../Components/AdminComponents/StatusByProcessChart";

import totalUserIcon from "../../assets/adminImages/icon1.png";
import activeUserIcon from "../../assets/adminImages/icon2.png";
import totalAmountIcon from "../../assets/adminImages/icon3.png";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";

const initialStatData = [
  { icon: totalUserIcon, value: 0, title: "Total Users" },
  { icon: activeUserIcon, value: 0, title: "Total Active User" },
  { icon: totalAmountIcon, value: 0, title: "Total Amount" },
];

const Dashboard = () => {
  const { usersData, activeUsersByMonth, transactions } = useOutletContext();
  const [statData, setStatData] = useState(initialStatData);

  useEffect(() => {
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
  }, [usersData]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0a101f] px-4 sm:px-6 md:px-10 lg:px-14 py-6 text-white font-sans">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 tracking-wide select-none text-start md:text-center">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statData?.map((item, idx) => (
          <Card
            key={idx}
            number={item?.value}
            img={item?.icon}
            text={item?.title}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section
          aria-labelledby="bar-chart-title"
          className="bg-[#0f172a] p-4 rounded-xl shadow-md"
        >
          <h2
            id="bar-chart-title"
            className="text-lg sm:text-xl font-semibold mb-4 tracking-wide select-none text-center"
          >
            User Statistics
          </h2>
          <div className="w-full h-[400px]">
            <StatsChart statData={usersData} />
          </div>
        </section>

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
          <div className="w-full h-[300px] sm:h-[350px]">
            <StatusByProcessChart statData={usersData} />
          </div>
        </section>
      </div>

      {/* Monthly Bar Chart */}
      <div className="mt-10 bg-[#0f172a] p-4 rounded-xl shadow-md w-full overflow-x-auto">
        <MonthlyBarChart activeUsersByMonth={activeUsersByMonth} />
      </div>

      {/* Latest Transactions */}
      <div className="mt-10">
        <LatestTransactions transactions={transactions} />
      </div>
    </div>
  );
};

export default Dashboard;
