import { useEffect, useRef, useState } from "react";
import { FaTrashAlt, FaEdit, FaSearch, FaTag } from "react-icons/fa";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput from "../../Components/AdminComponents/AdminInput";
import { AdminSearchInput } from "../../Components/AdminComponents/AdminInput";
import StatusBadge from "../../Components/AdminComponents/StatusBadge";

const Coupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    description: "",
    _id: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const codeRef = useRef(null);

  // ---------------- FETCH COUPONS ----------------
  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-coupons`, {
        withCredentials: true,
      });

      console.log("Coupons response:", res.data);
      // backend: { success: true, coupons: [...] }
      setCoupons(res.data.coupons || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      alert("Failed to load coupons");
    }
  };

  // ---------------- MODAL OPEN/CLOSE ----------------
  const openModal = (index = null) => {
    if (index !== null) {
      const c = coupons[index];
      setFormData({
        _id: c._id,
        code: c.code || "",
        discountPercent: String(c.discountPercent ?? ""),
        // normalize dates for input[type="date"]
        startDate: c.startDate ? c.startDate.slice(0, 10) : "",
        endDate: c.endDate ? c.endDate.slice(0, 10) : "",
        description: c.description || "",
      });
      setEditingIndex(index);
    } else {
      setFormData({
        code: "",
        discountPercent: "",
        startDate: "",
        endDate: "",
        description: "",
        _id: "",
      });
      setEditingIndex(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({
      code: "",
      discountPercent: "",
      startDate: "",
      endDate: "",
      description: "",
      _id: "",
    });
    setEditingIndex(null);
  };

  // ---------------- INPUT CHANGE ----------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // sirf number allow for discountPercent
    if (name === "discountPercent") {
      if (value === "" || /^[0-9\b]+$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- VALIDATION ----------------
  const validateForm = () => {
    const { code, discountPercent, startDate, endDate } = formData;

    if (!code.trim()) {
      alert("Please enter coupon code");
      return false;
    }

    if (!discountPercent || Number(discountPercent) <= 0) {
      alert("Please enter valid discount percent (> 0)");
      return false;
    }

    if (!startDate) {
      alert("Please select start date");
      return false;
    }

    if (!endDate) {
      alert("Please select end date");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("Start date cannot be greater than End date");
      return false;
    }

    return true;
  };

  // ---------------- SUBMIT ADD / EDIT ----------------
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      code: formData.code.trim(),
      discountPercent: Number(formData.discountPercent),
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
    };

    try {
      if (editingIndex !== null) {
        await axios.put(
          `${ADMIN_SERVER_URI}/edit-coupon`,
          {
            id: formData._id || coupons[editingIndex]._id,
            ...payload,
          },
          { withCredentials: true }
        );
        
      } else {
        await axios.post(`${ADMIN_SERVER_URI}/add-coupon`, payload, {
          withCredentials: true,
        });
        
      }
      fetchCoupons();
      closeModal();
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Error while saving coupon");
    }
  };

  // ---------------- DELETE COUPON ----------------
  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await axios.delete(`${ADMIN_SERVER_URI}/delete-coupon?id=${id}`, {
        withCredentials: true,
      });
      alert("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting Coupon:", error);
      alert("Error while deleting Coupon");
    }
  };

  // ---------------- SEARCH FILTER ----------------
  const filteredCoupons = coupons.filter((c) =>
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (modalOpen && codeRef.current) {
      setTimeout(() => codeRef.current.focus(), 100);
    }
  }, [modalOpen]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="min-h-screen bg-[#01071C] text-white p-4 sm:p-6">
      {/* Header */}
      <AdminCard className="mb-6" gradient>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <FaTag className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Coupon Management</h2>
              <p className="text-sm text-gray-400">Manage discount coupons</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <AdminSearchInput
              placeholder="Search Coupon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <AdminButton variant="primary" icon={<FaEdit />} onClick={() => openModal()} className="w-full sm:w-auto">
              Add Coupon
            </AdminButton>
          </div>
        </div>
      </AdminCard>

      {/* Coupon List */}
      <AdminCard padding="p-0" hoverEffect={false}>
        <div className="p-4 border-b border-white/5">
          <h3 className="font-semibold text-lg">Coupon List</h3>
          <p className="text-sm text-gray-400">{filteredCoupons.length} coupons found</p>
        </div>

        {filteredCoupons.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <FaTag className="text-3xl text-gray-500" />
            </div>
            <p className="text-gray-400">No Coupon found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredCoupons.map((coupon, index) => (
              <div
                key={coupon._id || index}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
                      {coupon.code?.slice(0, 3)?.toUpperCase() || "CPN"}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        {coupon.code}
                        <StatusBadge status={coupon.discountPercent > 0 ? "active" : "inactive"} />
                      </p>
                      <p className="text-sm text-gray-400">
                        {coupon.description || "No description"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {coupon.startDate?.slice(0, 10)} → {coupon.endDate?.slice(0, 10)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <AdminButton variant="outline" size="sm" icon={<FaEdit />} onClick={() => openModal(index)}>
                      Edit
                    </AdminButton>
                    <AdminButton variant="danger" size="sm" icon={<FaTrashAlt />} onClick={() => deleteCoupon(coupon._id)}>
                      Delete
                    </AdminButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FaTag className="text-white text-xl" />
              </div>
              <h3 className="text-2xl font-bold">
                {editingIndex !== null ? "Edit Coupon" : "Add Coupon"}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Coupon Code */}
              <AdminInput
                label="Coupon Code"
                name="code"
                placeholder="Enter coupon code (e.g., WELCOME10)"
                value={formData.code}
                onChange={handleInputChange}
                required
              />

              {/* Discount Percent */}
              <AdminInput
                label="Discount (%)"
                name="discountPercent"
                type="text"
                placeholder="Enter discount in % (e.g., 10)"
                value={formData.discountPercent}
                onChange={handleInputChange}
                required
              />

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="From Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
                <AdminInput
                  label="To Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <AdminInput
                label="Description"
                name="description"
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <AdminButton variant="secondary" onClick={closeModal} fullWidth>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSubmit} fullWidth>
                {editingIndex !== null ? "Update" : "Add"} Coupon
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupon;
