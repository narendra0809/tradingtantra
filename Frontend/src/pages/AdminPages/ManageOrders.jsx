/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { FaSearch, FaRegFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const orders = [
  {
    name: "Jayvion Simon",
    email: "nannie.abernathy70@gmail.com",
    date: "12-02-2025",
    orderId: "order_qwedfvbfa9f",
    transactionId: "#556533",
    amount: "INR 3,999",
    payment: "Paid",
    orderStatus: "Complete",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    name: "Lucian Obrien",
    email: "ashlynn.ohara62@gmail.com",
    date: "12-02-2025",
    orderId: "order_qwedfvbfa9f",
    transactionId: "#556533",
    amount: "INR 3,999",
    payment: "Unpaid",
    orderStatus: "Cancelled",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    name: "Lucian Obrien",
    email: "ashlynn.ohara62@gmail.com",
    date: "12-02-2025",
    orderId: "order_qwedfvbfa9f",
    transactionId: "#556533",
    amount: "INR 3,999",
    payment: "Paid",
    orderStatus: "Pending",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    name: "Deja Brady",
    email: "milo.farrell@hotmail.com",
    date: "12-02-2025",
    orderId: "order_qwedfvbfa9f",
    transactionId: "#556533",
    amount: "INR 3,999",
    payment: "Paid",
    orderStatus: "Complete",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    name: "Harrison Stein",
    email: "violet.ratke8@yahoo.com",
    date: "12-02-2025",
    orderId: "order_qwedfvbfa9f",
    transactionId: "#556533",
    amount: "INR 3,999",
    payment: "Unpaid",
    orderStatus: "Cancelled",
    avatar: "https://randomuser.me/api/portraits/men/13.jpg",
  },
  {
    name: "Reece Chung",
    email: "letha.lubowitz24@yahoo.com",
    date: "12-02-2025",
    orderId: "order_qwedfvbfa9f",
    transactionId: "#556533",
    amount: "INR 3,999",
    payment: "Paid",
    orderStatus: "Pending",
    avatar: "https://randomuser.me/api/portraits/men/14.jpg",
  },
];

const PaymentBadge = ({ status }) => {
  const base = "px-2 py-1 rounded-md text-xs sm:text-sm font-medium";
  return (
    <span
      className={`${base} ${
        status === "Paid" ? "bg-blue-600 text-white" : "bg-gray-300 text-black"
      }`}
    >
      {status}
    </span>
  );
};

const OrderStatusBadge = ({ status }) => {
  const base = "px-2 py-1 rounded-md text-xs sm:text-sm font-medium";
  const colorClass =
    status === "Complete"
      ? "bg-green-600"
      : status === "Cancelled"
      ? "bg-red-600"
      : "bg-yellow-500";
  return <span className={`${base} text-white ${colorClass}`}>{status}</span>;
};

const ManageOrders = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredOrders = orders.filter((item) => {
    const matchDate = selectedDate
      ? item.date.includes(selectedDate.split("-").reverse().join("-"))
      : true;
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDate && matchSearch;
  });

  const downloadInvoice = (order) => {
    const worksheet = XLSX.utils.json_to_sheet([order]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, `${order.name}_Invoice.xlsx`);
  };

  return (
    <div
      className="p-4 md:p-6 text-white w-full min-h-screen"
      style={{ backgroundColor: "#000A2D" }}
    >
      <h2 className="text-lg md:text-xl font-semibold mb-4">Manage Orders</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[#101B35] text-white px-3 py-2 rounded-md outline-none"
          />
        </div>

        <div className="relative w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search by name, email or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#101B35] text-white px-3 py-2 rounded-md pr-10 outline-none"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Mobile View - Card Layout */}
      {isMobileView ? (
        <div className="space-y-4">
          {filteredOrders.map((item, idx) => (
            <div key={idx} className="bg-[#101B35] p-4 rounded-lg shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-400 text-xs">{item.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{item.date}</div>
                  <div className="text-xs text-gray-400">{item.amount}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <div className="text-gray-400">Order ID</div>
                  <div className="truncate">{item.orderId}</div>
                </div>
                <div>
                  <div className="text-gray-400">Transaction ID</div>
                  <div className="truncate">{item.transactionId}</div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <PaymentBadge status={item.payment} />
                  <OrderStatusBadge status={item.orderStatus} />
                </div>
                <FaRegFilePdf
                  className="text-white cursor-pointer text-lg"
                  onClick={() => downloadInvoice(item)}
                  title="Download Invoice"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop View - Scrollable Table on lg screens and above */
        <div className="lg:overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left font-medium border-b border-gray-600 text-white">
                  <th className="py-3 px-2 whitespace-nowrap">Name & Email</th>
                  <th className="py-3 px-2 whitespace-nowrap">Date</th>
                  <th className="py-3 px-2 whitespace-nowrap">Order ID</th>
                  <th className="py-3 px-2 whitespace-nowrap">
                    Transaction ID
                  </th>
                  <th className="py-3 px-2 whitespace-nowrap">Amount</th>
                  <th className="py-3 px-2 whitespace-nowrap">Payment</th>
                  <th className="py-3 px-2 whitespace-nowrap">Status</th>
                  <th className="py-3 px-2 whitespace-nowrap">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#1f2a3e] hover:bg-[#101B35]"
                  >
                    <td className="py-3 px-2 flex items-center gap-2 min-w-[200px]">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-400 text-xs">
                          {item.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">{item.date}</td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      {item.orderId}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      {item.transactionId}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      {item.amount}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <PaymentBadge status={item.payment} />
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <OrderStatusBadge status={item.orderStatus} />
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <FaRegFilePdf
                        className="text-white cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => downloadInvoice(item)}
                        title="Download Invoice"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No orders found matching your criteria
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
