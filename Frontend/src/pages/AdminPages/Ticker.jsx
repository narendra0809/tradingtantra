import { useEffect, useRef, useState } from "react";
import { FaTrashAlt, FaEdit, FaSearch, FaChartLine } from "react-icons/fa";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput from "../../Components/AdminComponents/AdminInput";
import { AdminSearchInput } from "../../Components/AdminComponents/AdminInput";

const Ticker = () => {
  const [tickers, setTickers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    proName: "",
    description: "",
    _id: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const proNameRef = useRef(null);

  const fetchTickers = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-tickers`, {
        withCredentials: true,
      });
      console.log(res.data.tickers);
      setTickers(res.data.tickers || []);
    } catch (error) {
      console.error("Error fetching tickers:", error);
    }
  };

  const openModal = (index = null) => {
    if (index !== null) {
      setFormData(tickers[index]);
      setEditingIndex(index);
    } else {
      setFormData({ proName: "", description: "", _id: "" });
      setEditingIndex(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({ proName: "", description: "", _id: "" });
    setEditingIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editingIndex !== null) {
        await axios.put(
          `${ADMIN_SERVER_URI}/edit-ticker`,
          { ...formData, id: tickers[editingIndex]._id },
          { withCredentials: true }
        );
      } else {
        await axios.post(`${ADMIN_SERVER_URI}/add-ticker`, formData, {
          withCredentials: true,
        });
      }
      fetchTickers();
      closeModal();
    } catch (error) {
      console.error("Error saving ticker:", error);
    }
  };

  const deleteTicker = async (id) => {
    if (window.confirm("Are you sure you want to delete this ticker?")) {
      try {
        await axios.delete(`${ADMIN_SERVER_URI}/delete-ticker?id=${id}`, {
          withCredentials: true,
        });
        fetchTickers();
      } catch (error) {
        console.error("Error deleting ticker:", error);
      }
    }
  };

  const filteredTickers = tickers.filter((t) =>
    t.proName.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (modalOpen && proNameRef.current) {
      setTimeout(() => proNameRef.current.focus(), 100);
    }
  }, [modalOpen]);

  useEffect(() => {
    fetchTickers();
  }, []);

  return (
    <div className="min-h-screen bg-[#01071C] text-white p-4 sm:p-6">
      {/* Header */}
      <AdminCard className="mb-6" gradient>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <FaChartLine className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Ticker Management</h2>
              <p className="text-sm text-gray-400">Manage stock tickers</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <AdminSearchInput
              placeholder="Search ticker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <AdminButton variant="primary" icon={<FaEdit />} onClick={() => openModal()} className="w-full sm:w-auto">
              Add Ticker
            </AdminButton>
          </div>
        </div>
      </AdminCard>

      {/* Ticker List */}
      <AdminCard padding="p-0" hoverEffect={false}>
        <div className="p-4 border-b border-white/5">
          <h3 className="font-semibold text-lg">Ticker List</h3>
          <p className="text-sm text-gray-400">{filteredTickers.length} tickers found</p>
        </div>

        {filteredTickers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <FaChartLine className="text-3xl text-gray-500" />
            </div>
            <p className="text-gray-400">No tickers found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTickers.map((ticker, index) => (
              <div key={ticker._id || index} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center font-bold">
                      {ticker.proName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold">{ticker.proName}</p>
                      <p className="text-sm text-gray-400">{ticker.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <AdminButton variant="outline" size="sm" icon={<FaEdit />} onClick={() => openModal(index)}>Edit</AdminButton>
                    <AdminButton variant="danger" size="sm" icon={<FaTrashAlt />} onClick={() => deleteTicker(ticker._id)}>Delete</AdminButton>
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-white text-xl" />
              </div>
              <h3 className="text-2xl font-bold">
                {editingIndex !== null ? "Edit Ticker" : "Add Ticker"}
              </h3>
            </div>

            <div className="space-y-4">
              <AdminInput
                label="Pro Name"
                name="proName"
                placeholder="Enter pro name (e.g., SBIN)"
                value={formData.proName}
                onChange={handleInputChange}
                required
              />

              <AdminInput
                label="Description"
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <AdminButton variant="secondary" onClick={closeModal} fullWidth>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSubmit} fullWidth>
                {editingIndex !== null ? "Update" : "Add"} Ticker
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticker;
