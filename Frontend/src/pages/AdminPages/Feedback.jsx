import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaFolderOpen } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import { useEffect } from "react";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState({});

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-feedbacks`, {
        withCredentials: true,
      });
      console.log(res.data.feedbacks);
      setFeedbacks(res.data.feedbacks);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles((prev) => ({
        ...prev,
        [index]: file.name,
      }));
    }
  };

  const filteredData = feedbacks.filter((item) => {
    console.log(item);
    const formattedDate = formatDate(selectedDate);
    const matchesDate = selectedDate ? item.date === formattedDate : true;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div
      className="p-6 rounded-xl text-white w-full"
      style={{ backgroundColor: "#000A2D" }}
    >
      <h2 className="text-lg font-semibold mb-4">Feedback Details</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div
          className="px-4 py-2 rounded-md w-full md:w-1/3"
          style={{ backgroundColor: "#101B35" }}
        >
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent outline-none text-white w-full"
          />
        </div>

        <div className="relative w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-md w-full outline-none text-white pr-10"
            style={{ backgroundColor: "#101B35" }}
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Responsive Scrollable Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-sm font-medium text-white border-b border-gray-600">
              <th className="py-2 px-2 whitespace-nowrap">Name</th>
              <th className="py-2 px-2 whitespace-nowrap">Date</th>
              <th className="py-2 px-2 whitespace-nowrap">Category</th>
              <th className="py-2 px-2 whitespace-nowrap">Image</th>
              <th className="py-2 px-2 whitespace-nowrap">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#1f2a3e] hover:bg-[#101B35]"
                >
                  <td className="py-3 px-2 font-medium whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    {item.createdAt.split("T")[0]}
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    {item.category}
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <label className="cursor-pointer flex items-center gap-2">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, idx)}
                      />
                      {uploadedFiles[idx] ? (
                        <FaCheckCircle className="text-green-400 text-xl" />
                      ) : (
                        <FaFolderOpen className="text-yellow-400 text-xl" />
                      )}
                    </label>
                    {uploadedFiles[idx] && (
                      <span className="text-xs mt-1 block text-gray-400 truncate max-w-[150px]">
                        {uploadedFiles[idx]}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-gray-300 min-w-[200px]">
                    {item.message}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 px-2 text-center text-gray-400">
                  No feedback found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Feedback;
