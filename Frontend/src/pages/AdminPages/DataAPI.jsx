import { useState } from "react";

const apiDataList = Array(8).fill({
  publicKey: "fcgfjjghjghmjhg",
  privateKey: "ggssddvdfbdfb",
});

const DataAPI = () => {
  const [apiData, setApiData] = useState(apiDataList);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({ publicKey: "", privateKey: "" });

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ publicKey: "", privateKey: "" });
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    setIsEditing(true);
    setEditIndex(index);
    setFormData(apiData[index]);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveData = () => {
    if (!formData.publicKey.trim() || !formData.privateKey.trim()) {
      alert("Both fields are required.");
      return;
    }

    if (isEditing) {
      const updated = [...apiData];
      updated[editIndex] = formData;
      setApiData(updated);
    } else {
      setApiData((prev) => [...prev, formData]);
    }

    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold">Data API</h2>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap"
        >
          Add Data API ↗
        </button>
      </div>

      {/* Table wrapper for scroll */}
      <div className="overflow-x-auto rounded-xl shadow-md bg-[#000A2D] max-w-full">
        <div className="min-w-[600px]">
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-gray-700 p-4 text-sm font-semibold text-gray-300">
            <div className="px-4">Public Key</div>
            <div className="px-4">Private Key</div>
            <div className="px-4 text-center">Action</div>
          </div>

          {/* Table Rows */}
          {apiData.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-3 items-center border-b border-gray-800 px-4 py-3 text-sm hover:bg-gray-900 transition-colors"
            >
              <div className="truncate px-4">{row.publicKey}</div>
              <div className="truncate px-4">{row.privateKey}</div>
              <div className="flex justify-center">
                <button
                  onClick={() => openEditModal(index)}
                  className="hover:text-blue-400 text-white text-lg"
                  aria-label="Edit API Key"
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
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
                name="publicKey"
                value={formData.publicKey}
                onChange={handleChange}
                placeholder="Public Key"
                className="w-full px-3 py-2 bg-[#1b2d5c] rounded-md outline-none"
              />
              <input
                type="text"
                name="privateKey"
                value={formData.privateKey}
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
