import { useEffect, useRef, useState } from "react";
import { FaTrashAlt, FaEdit, FaSearch } from "react-icons/fa";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Ticker Management</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search ticker..."
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
            Add Ticker
          </button>
        </div>
      </div>

      {/* Ticker List */}
      <div className="bg-[#0B132B] rounded-xl border border-gray-800 overflow-x-auto">
        <div className="p-4 font-semibold text-sm text-gray-400 whitespace-nowrap">
          Ticker List
        </div>

        {filteredTickers.length === 0 ? (
          <p className="text-center text-gray-500 p-6">No tickers found.</p>
        ) : (
          filteredTickers.map((ticker, index) => (
            <div
              key={ticker._id || index}
              className="px-4 py-4 border-t border-gray-800 min-w-[360px]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                    {ticker.proName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold">
                      {ticker.proName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {ticker.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-lg mt-2 sm:mt-0">
                  <FaEdit
                    onClick={() => openModal(index)}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  />
                  <FaTrashAlt
                    onClick={() => deleteTicker(ticker._id)}
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
                {editingIndex !== null ? "Edit Ticker" : "Add Ticker"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-blue-400 mb-1">
                    Pro Name
                  </label>
                  <input
                    ref={proNameRef}
                    type="text"
                    name="proName"
                    placeholder="Enter pro name (e.g., SBIN)"
                    value={formData.proName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-transparent border border-blue-500 rounded-lg text-white outline-none placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-blue-400 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Enter description"
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
                  {editingIndex !== null ? "Update" : "Add"} Ticker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticker;
