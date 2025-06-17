import { useRef, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import { useEffect } from "react";

const Updates = () => {
  const [formData, setFormData] = useState({
    date: "",
    category: "",
    description: "",
  });
  const [updates, setUpdates] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dateInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.category) newErrors.category = "Category is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${ADMIN_SERVER_URI}/post-update`,
        formData,
        { withCredentials: true }
      );
      if (res.status !== 200) {
        throw new Error("Failed to post update!");
      }
      setFormData({ date: "", category: "", description: "" });
      setErrors({});
      fetchUpdates();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openDatePicker = () => {
    dateInputRef.current?.showPicker();
  };

  const fetchUpdates = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-updates`, {
        withCredentials: true,
      });
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      setUpdates(res.data.updates);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-[#000A2D] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Updates Table */}
        <div className="mb-8 bg-[#0F1629] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 md:p-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-sans">
              Recent Updates
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {updates.length > 0 ? (
                    updates.map((update) => (
                      <tr
                        key={update._id}
                        className="border-b border-gray-800 hover:bg-[#1A1F2E]"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(update.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {update.category}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">
                          {update.description}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-6 text-center text-gray-400"
                      >
                        No updates available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="p-6 rounded-2xl shadow-xl bg-[#0F1629]">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 font-sans">
            Add New Update
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            {/* Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 font-sans">
                Date
              </label>
              <div
                className={`relative w-full rounded-md bg-[#1A1F2E] cursor-pointer ${
                  errors.date
                    ? "ring-2 ring-red-500"
                    : "focus-within:ring-2 focus-within:ring-blue-500"
                }`}
                onClick={openDatePicker}
              >
                <FaRegCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <div className="pl-12 pr-4 py-3 text-white font-sans">
                  {formData.date || (
                    <span className="text-gray-500">Select a date</span>
                  )}
                </div>

                <input
                  type="date"
                  name="date"
                  ref={dateInputRef}
                  value={formData.date}
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 font-sans">
                Category
              </label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
                className={`w-full px-4 py-3 rounded-md bg-[#1A1F2E] text-white font-sans focus:outline-none focus:ring-2 ${
                  errors.category ? "ring-red-500" : "focus:ring-blue-500"
                }`}
              />

              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2 font-sans">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                className={`w-full px-4 py-3 rounded-md bg-[#1A1F2E] text-white placeholder-gray-500 font-sans resize-none focus:outline-none focus:ring-2 ${
                  errors.description ? "ring-red-500" : "focus:ring-blue-500"
                }`}
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-md font-sans transition-all duration-150 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Update"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Updates;
