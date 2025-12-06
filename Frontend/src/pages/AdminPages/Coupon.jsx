import { useEffect, useRef, useState } from "react";
import { FaTrashAlt, FaEdit, FaSearch } from "react-icons/fa";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Coupon Management</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Coupon..."
              className="bg-[#101B35] w-full text-white px-4 py-2 rounded-md outline-none placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-semibold w-full sm:w-auto"
            onClick={() => openModal()}
          >
            Add Coupon
          </button>
        </div>
      </div>

      {/* Coupon List */}
      <div className="bg-[#0B132B] rounded-xl border border-gray-800 overflow-x-auto">
        <div className="p-4 font-semibold text-sm text-gray-400 whitespace-nowrap">
          Coupon List
        </div>

        {filteredCoupons.length === 0 ? (
          <p className="text-center text-gray-500 p-6">No Coupon found.</p>
        ) : (
          filteredCoupons.map((coupon, index) => (
            <div
              key={coupon._id || index}
              className="px-4 py-4 border-t border-gray-800 min-w-[360px]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                    {coupon.code?.slice(0, 3)?.toUpperCase() || "CPN"}
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold">
                      {coupon.code}{" "}
                      <span className="text-xs text-green-400">
                        ({coupon.discountPercent}% OFF)
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">
                      {coupon.description || "No description"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {coupon.startDate?.slice(0, 10)} →{" "}
                      {coupon.endDate?.slice(0, 10)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-lg mt-2 sm:mt-0">
                  <FaEdit
                    onClick={() => openModal(index)}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  />
                  <FaTrashAlt
                    onClick={() => deleteCoupon(coupon._id)}
                    className="text-red-500 hover:text-red-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 overflow-auto">
          <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <div className="bg-[#071540] text-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-bold text-center mb-6">
                {editingIndex !== null ? "Edit Coupon" : "Add Coupon"}
              </h3>

              <div className="space-y-4">
                {/* Coupon Code */}
                <div>
                  <label className="block text-sm text-blue-400 mb-1">
                    Coupon Code
                  </label>
                  <input
                    ref={codeRef}
                    type="text"
                    name="code"
                    placeholder="Enter coupon code (e.g., WELCOME10)"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-transparent border border-blue-500 rounded-lg text-white outline-none placeholder-gray-400"
                  />
                </div>

                {/* Discount Percent */}
                <div>
                  <label className="block text-sm text-blue-400 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="text"
                    name="discountPercent"
                    placeholder="Enter discount in % (e.g., 10)"
                    value={formData.discountPercent}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-transparent border border-blue-500 rounded-lg text-white outline-none placeholder-gray-400"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-blue-400 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-transparent border border-blue-500 rounded-lg text-white outline-none placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-blue-400 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-transparent border border-blue-500 rounded-lg text-white outline-none placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-blue-400 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Enter description (optional)"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-transparent border border-blue-500 rounded-lg text-white outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-md font-semibold"
                >
                  {editingIndex !== null ? "Update" : "Add"} Coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupon;
