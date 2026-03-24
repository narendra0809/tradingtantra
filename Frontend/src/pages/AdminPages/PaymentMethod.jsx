/* eslint-disable react/prop-types */
import { useState } from "react";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import { useEffect } from "react";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput from "../../Components/AdminComponents/AdminInput";
import { FaCreditCard, FaEdit } from "react-icons/fa";
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
        <AdminCard className="mb-6" gradient>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <FaCreditCard className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Payment Method</h2>
              <p className="text-sm text-gray-400">Manage payment keys</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard padding="p-0" hoverEffect={false}>
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-white/5 p-4 text-sm font-semibold text-gray-400">
            <div className="col-span-4">Key ID</div>
            <div className="col-span-4">Key Secret</div>
            <div className="col-span-3">Webhook Secret</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {/* Data Row */}
          <div className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-white/5 transition-colors">
            <div className="col-span-4 truncate font-mono text-sm cursor-pointer" onClick={() => setActiveField(activeField === "keyId" ? null : "keyId")}>
              {activeField === "keyId" ? keys.key_id : maskSensitiveData(keys.key_id)}
            </div>
            <div className="col-span-4 truncate font-mono text-sm cursor-pointer" onClick={() => setActiveField(activeField === "keySecret" ? null : "keySecret")}>
              {activeField === "keySecret" ? keys.key_secret : maskSensitiveData(keys.key_secret)}
            </div>
            <div className="col-span-3 truncate font-mono text-sm cursor-pointer" onClick={() => setActiveField(activeField === "webhook" ? null : "webhook")}>
              {activeField === "webhook" ? keys.webhook : maskSensitiveData(keys.webhook)}
            </div>
            <div className="col-span-1 flex justify-end">
              <AdminButton variant="outline" size="sm" icon={<FaEdit />} onClick={handleEditClick}>
                Edit
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 rounded-2xl w-full max-w-md shadow-2xl border border-white/10 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FaCreditCard className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-semibold">Edit Payment Keys</h3>
            </div>
            <div className="space-y-4">
              <AdminInput
                label="Key ID"
                name="key_id"
                placeholder="Key ID"
                value={editData.key_id}
                onChange={handleChange}
              />
              <AdminInput
                label="Key Secret"
                name="key_secret"
                placeholder="Key Secret"
                value={editData.key_secret}
                onChange={handleChange}
              />
              <AdminInput
                label="Webhook Secret"
                name="webhook"
                placeholder="Webhook Secret"
                value={editData.webhook}
                onChange={handleChange}
              />
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <AdminButton variant="secondary" onClick={handleCancel}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSave}>
                Save Changes
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
