/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput, { AdminSearchInput } from "../../Components/AdminComponents/AdminInput";
import { FaFolderOpen, FaCheckCircle, FaCommentDots } from "react-icons/fa";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-feedbacks`, {
        withCredentials: true,
      });
      setFeedbacks(res.data.feedbacks);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
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
    const matchesDate = selectedDate
      ? formatDate(item.createdAt?.split("T")[0]) === formatDate(selectedDate)
      : true;
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0a101f] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FaCommentDots className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Feedback Details</h2>
            <p className="text-gray-400 text-sm">{feedbacks.length} total feedbacks</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <AdminCard className="mb-6" padding="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <AdminSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, category or message..."
            />
          </div>
          <div className="w-full lg:w-64">
            <AdminInput
              type="date"
              label="Filter by Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          {(searchTerm || selectedDate) && (
            <AdminButton
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setSelectedDate("");
              }}
            >
              Clear Filters
            </AdminButton>
          )}
        </div>
      </AdminCard>

      {/* Table Card */}
      <AdminCard padding="p-0" hoverEffect={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-400">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading feedbacks...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">📭</span>
                      <span>No feedback found for the selected filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-white/5 transition-all duration-200"
                  >
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {item.createdAt?.split("T")[0]}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <label className="cursor-pointer flex items-center gap-2 hover:text-blue-400 transition-colors">
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
                        <span className="text-xs mt-1 block text-gray-500 truncate max-w-[150px]">
                          {uploadedFiles[idx]}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300 max-w-xs">
                      <p className="truncate">{item.message}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Results count */}
        {!isLoading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-white/5 text-sm text-gray-500">
            Showing {filteredData.length} of {feedbacks.length} feedbacks
          </div>
        )}
      </AdminCard>
    </div>
  );
};

export default Feedback;
