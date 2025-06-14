/* eslint-disable react/prop-types */
import { useState } from "react";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import { useEffect } from "react";
const PencilIcon = ({ className, onClick }) => (
  <svg
    onClick={onClick}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
    />
  </svg>
);

const PaymentMethod = () => {
  const [keys, setKeys] = useState({
    key_id: "fcgfjjghjghmjhg",
    key_secret: "ggssddvdfbdfb",
    webhook: "asdsadsadsd",
  });
  const [editData, setEditData] = useState({
    key_id: "",
    key_secret: "",
    webhook: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const fetchKeys = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-payment-keys`, {
        withCredentials: true,
      });

      setKeys(res.data.paymentKeys);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditClick = async () => {
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`${ADMIN_SERVER_URI}/update-payment-keys`, editData, {
        withCredentials: true,
      });
      setKeys(editData);
    } catch (error) {
      console.log(error);
    } finally {
      setModalOpen(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const maskSensitiveData = (data) => {
    if (!data) return "";
    return data.replace(/.(?=.{4})/g, "•");
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Payment Method
        </h2>

        <div className="bg-[#0E1A40] rounded-xl shadow-lg overflow-hidden border border-[#1B2D5C]">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-[#1B2D5C] p-4 text-sm font-semibold text-gray-300">
            <div className="col-span-4">Key ID</div>
            <div className="col-span-4">Key Secret</div>
            <div className="col-span-3">Webhook Secret</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {/* Data Row */}
          <div className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-[#1B2D5C] transition-colors">
            <div
              className="col-span-4 truncate font-mono text-sm cursor-pointer"
              onClick={() =>
                setActiveField(activeField === "keyId" ? null : "keyId")
              }
            >
              {activeField === "keyId"
                ? keys.key_id
                : maskSensitiveData(keys.key_id)}
            </div>
            <div
              className="col-span-4 truncate font-mono text-sm cursor-pointer"
              onClick={() =>
                setActiveField(activeField === "keySecret" ? null : "keySecret")
              }
            >
              {activeField === "keySecret"
                ? keys.key_secret
                : maskSensitiveData(keys.key_secret)}
            </div>
            <div
              className="col-span-3 truncate font-mono text-sm cursor-pointer"
              onClick={() =>
                setActiveField(activeField === "webhook" ? null : "webhook")
              }
            >
              {activeField === "webhook"
                ? keys.webhook
                : maskSensitiveData(keys.webhook)}
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                aria-label="Edit"
                onClick={handleEditClick}
                className="p-1 rounded-full hover:bg-[#2D3E6B] transition-colors"
              >
                <PencilIcon className="w-5 h-5 text-blue-400 hover:text-blue-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-[#0E1A40] p-6 rounded-lg w-full max-w-md border border-[#1B2D5C] shadow-xl">
            <h3 className="text-xl font-semibold mb-6">Edit Payment Keys</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Key ID
                </label>
                <input
                  type="text"
                  name="key_id"
                  placeholder="Key ID"
                  value={editData.key_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B2D5C] rounded-md outline-none border border-[#2D3E6B] focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Key Secret
                </label>
                <input
                  type="text"
                  name="key_secret"
                  placeholder="Key Secret"
                  value={editData.key_secret}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B2D5C] rounded-md outline-none border border-[#2D3E6B] focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Webhook Secret
                </label>
                <input
                  type="text"
                  name="webhook"
                  placeholder="Webhook Secret"
                  value={editData.webhook}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B2D5C] rounded-md outline-none border border-[#2D3E6B] focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-md bg-[#1B2D5C] hover:bg-[#2D3E6B] text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
