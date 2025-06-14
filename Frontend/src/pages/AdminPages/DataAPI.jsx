import axios from "axios";
import { useState } from "react";
import { ADMIN_SERVER_URI } from "./Home";
import { useEffect } from "react";

const DataAPI = () => {
  const [apiData, setApiData] = useState({
    token: "",
    clientId: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({ token: "", clientId: "" });

  const openEditModal = () => {
    setIsEditing(true);
    setFormData(apiData);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveData = async () => {
    if (!formData.token.trim() || !formData.clientId.trim()) {
      alert("Both fields are required.");
      return;
    }

    if (isEditing) {
      try {
        await axios.put(`${ADMIN_SERVER_URI}/update-data-keys`, formData, {
          withCredentials: true,
        });
        setApiData(formData);
      } catch (error) {
        console.log(error);
      }
    }
    setModalOpen(false);
  };

  const fetchDataApi = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-data-keys`, {
        withCredentials: true,
      });
      setApiData(res.data.dataKeys);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataApi();
  }, []);
  return (
    <div className="min-h-screen bg-[#000A2D] text-white p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold">Data API</h2>
      </div>

      {/* Table wrapper for scroll */}
      <div className="overflow-x-auto rounded-xl shadow-md bg-[#000A2D] max-w-full">
        <div className="min-w-[600px]">
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-gray-700 p-4 text-sm font-semibold text-gray-300">
            <div className="px-4">Token</div>
            <div className="px-4">Client ID</div>
            <div className="px-4 text-center">Action</div>
          </div>

          {/* Table Rows */}
          <div className="grid grid-cols-3 items-center border-b border-gray-800 px-4 py-3 text-sm hover:bg-gray-900 transition-colors">
            <div className="truncate px-4">{apiData.token}</div>
            <div className="truncate px-4">{apiData.clientId}</div>
            <div className="flex justify-center">
              <button
                onClick={() => openEditModal()}
                className="hover:text-blue-400 text-white text-lg"
                aria-label="Edit API Key"
              >
                ✏️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#0e1a40] p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit" : "Add"} API Key
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                name="token"
                value={formData.token}
                onChange={handleChange}
                placeholder="Public Key"
                className="w-full px-3 py-2 bg-[#1b2d5c] rounded-md outline-none"
              />
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                placeholder="Private Key"
                className="w-full px-3 py-2 bg-[#1b2d5c] rounded-md outline-none"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveData}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-sm"
              >
                {isEditing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAPI;
