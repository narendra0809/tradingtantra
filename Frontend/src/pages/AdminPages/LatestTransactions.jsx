/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

const transactions = [
  {
    name: "Jayvion Simon",
    email: "nannie.abernathy70@gmail.com",
    date: "2025-02-12",
    invoice: "#5575",
    amount: "INR 3,999",
    status: "Paid",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    name: "Lucian Obrien",
    email: "ashlynn.ohara62@gmail.com",
    date: "2025-02-12",
    invoice: "#5576",
    amount: "-",
    status: "Unpaid",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    name: "Deja Brady",
    email: "milo.farrell@hotmail.com",
    date: "2025-02-13",
    invoice: "#5577",
    amount: "INR 3,999",
    status: "Paid",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    name: "Harrison Stein",
    email: "violet.ratke8@yahoo.com",
    date: "2025-02-14",
    invoice: "#5578",
    amount: "-",
    status: "Unpaid",
    avatar: "https://randomuser.me/api/portraits/men/13.jpg",
  },
  {
    name: "Reece Chung",
    email: "letha.lubowitz24@yahoo.com",
    date: "2025-02-14",
    invoice: "#5579",
    amount: "INR 3,999",
    status: "Paid",
    avatar: "https://randomuser.me/api/portraits/men/14.jpg",
  },
];

const StatusButton = ({ status }) => (
  <span
    className={`px-3 py-1 text-xs rounded-md font-medium ${
      status === "Paid" ? "bg-blue-600 text-white" : "bg-gray-300 text-black"
    }`}
  >
    {status}
  </span>
);

const LatestTransactions = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter((tx) => {
    const matchDate = selectedDate ? tx.date === selectedDate : true;
    const matchSearch = searchTerm
      ? tx.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchDate && matchSearch;
  });

  return (
    <div className="bg-[#000A2D] p-4 rounded-xl text-white w-full">
      <h2 className="text-lg font-semibold mb-4">Latest Transactions</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Date Filter */}
        <div className="flex items-center bg-[#101B35] px-3 py-2 rounded-md w-full md:w-1/3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent outline-none text-white w-full"
          />
        </div>

        {/* Search Filter */}
        <div className="relative w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#101B35] px-4 py-2 rounded-md w-full outline-none text-white pr-10"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[650px] w-full">
          <thead>
            <tr className="text-left text-sm font-medium text-white border-b border-gray-600">
              <th className="py-2 px-2">
                <input type="checkbox" />
              </th>
              <th className="py-2 px-2">Name & Email</th>
              <th className="py-2 px-2">Date</th>
              <th className="py-2 px-2">Invoice</th>
              <th className="py-2 px-2">Amount</th>
              <th className="py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, idx) => (
                <tr
                  key={idx}
                  className="text-sm border-b border-[#1f2a3e] hover:bg-[#101B35]"
                >
                  <td className="py-3 px-2">
                    <input type="checkbox" />
                  </td>
                  <td className="py-3 px-2 flex items-center gap-3">
                    <img
                      src={tx.avatar}
                      alt={tx.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{tx.name}</div>
                      <div className="text-gray-400 text-xs">{tx.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-2">{tx.date}</td>
                  <td className="py-3 px-2">{tx.invoice}</td>
                  <td className="py-3 px-2">{tx.amount}</td>
                  <td className="py-3 px-2">
                    <StatusButton status={tx.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LatestTransactions;
