import axios from "axios";
import { useEffect, useState } from "react";
import { ADMIN_SERVER_URI } from "../AdminPages/Home";

const UpdatesPageDashboard = () => {
  // const updates = [
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  //   {
  //     date: "2025-01-27",
  //     type: "Release",
  //     desc: "Intraday Boost Filters 🔥🔥 Now filter out stocks in Intraday Boost to find pinpoints stocks to trade in Intraday.",
  //   },
  //   {
  //     date: "2025-01-21",
  //     type: "Improvement",
  //     desc: "R. Factor is supercharged! 🚀 We rebuilt it from the ground up to find the best momentum stocks. Get ready for a whole new level of results, starting today!",
  //   },
  //   {
  //     date: "2024-10-19",
  //     type: "Update",
  //     desc: "After thorough backtesting, updated the core engine behind Contraction BO stocks in Insider Strategies for better results and accuracy for all the users.",
  //   },
  // ];
  const [updates, setUpdates] = useState([]);

  const fetchUpdates = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-updates`);
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      console.log(res.data.updates);
      setUpdates(res.data.updates);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);
  return (
    <>
      <div className="w-full h-auto p-6 mt-10 md:p-10 border-2 border-[#0256F5] rounded-lg">
        {updates.map((item, index) => (
          <div
            key={index}
            className="py-5 flex flex-col md:flex-row items-start md:items-center justify-start gap-4 md:gap-8 border-b border-b-[#013AA6] w-full"
          >
            <p className="text-base w-32 md:w-40">{item.date.split("T")[0]}</p>
            <div
              className="w-24 h-10 flex items-center justify-center rounded-lg text-xs font-semibold"
              style={{
                backgroundColor:
                  item.category === "Release"
                    ? "#6E9FFE"
                    : item.category === "Improvement"
                    ? "#151B2D"
                    : "var(--color-primary)",
              }}
            >
              <p
                className={
                  item.category === "Improvement"
                    ? "text-white"
                    : "text-[#03071B]"
                }
              >
                {item.category}
              </p>
            </div>
            <p className="text-sm dark:text-[#FFFFFF80] text-wrap md:flex-1">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default UpdatesPageDashboard;
