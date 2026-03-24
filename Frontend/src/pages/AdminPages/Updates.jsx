import { useRef, useState } from "react";
import { FaRegCalendarAlt, FaBell } from "react-icons/fa";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import { useEffect } from "react";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput from "../../Components/AdminComponents/AdminInput";
import AdminTable from "../../Components/AdminComponents/AdminTable";

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
        <AdminCard className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <FaBell className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Recent Updates</h2>
              <p className="text-sm text-gray-400">{updates.length} updates found</p>
            </div>
          </div>

          <AdminTable
            columns={[
              { key: "date", label: "Date" },
              { key: "category", label: "Category" },
              { key: "description", label: "Description" },
            ]}
            data={updates}
            emptyMessage="No updates available"
          />
        </AdminCard>

        {/* Update Form */}
        <AdminCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FaBell className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold">Add New Update</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Date */}
            <AdminInput
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
              required
            />

            {/* Category */}
            <AdminInput
              label="Category"
              name="category"
              placeholder="Enter category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              required
            />

            {/* Description */}
            <AdminInput
              label="Description"
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              required
            />

            <AdminButton variant="primary" type="submit" loading={loading} fullWidth>
              Add Update
            </AdminButton>
          </form>
        </AdminCard>
      </div>
    </div>
  );
};

export default Updates;
