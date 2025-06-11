/* eslint-disable react/prop-types */
import { useState } from "react";

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
  const [rows, setRows] = useState(
    Array(8).fill({
      publicKey: "fcgfjjghjghmjhg",
      privateKey: "ggssddvdfbdfb",
    })
  );

  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ publicKey: "", privateKey: "" });
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditData({ ...rows[index] });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveChanges = () => {
    const updatedRows = [...rows];
    updatedRows[editIndex] = { ...editData };
    setRows(updatedRows);
    setModalOpen(false);
    setEditIndex(null);
  };

  return (
    <div
      className="min-h-screen text-white p-4 sm:p-6"
      style={{ backgroundColor: "#000A2D" }}
    >
      <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>

      <div
        className="rounded-xl shadow-lg w-full max-w-4xl overflow-x-auto"
        style={{ backgroundColor: "#000A2D" }}
      >
        {/* Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-700 p-4 text-sm font-semibold text-gray-300 min-w-[600px]">
          <div>Public Key</div>
          <div>Private Key</div>
          <div className="text-center">Action</div>
        </div>

        {/* Rows */}
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-3 items-center border-b border-gray-800 px-4 py-3 text-sm hover:bg-gray-900 transition-colors min-w-[600px]"
          >
            <div className="truncate mb-2 sm:mb-0">{row.publicKey}</div>
            <div className="truncate mb-2 sm:mb-0">{row.privateKey}</div>
            <div className="flex justify-center">
              <button onClick={() => handleEdit(index)} aria-label="Edit">
                <PencilIcon className="w-5 h-5 text-white hover:text-blue-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0e1a40] p-6 rounded-md w-full max-w-md text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Payment Keys</h3>
            <div className="space-y-3">
              <input
                type="text"
                name="publicKey"
                placeholder="Public Key"
                value={editData.publicKey}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1b2d5c] rounded-md outline-none"
              />
              <input
                type="text"
                name="privateKey"
                placeholder="Private Key"
                value={editData.privateKey}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1b2d5c] rounded-md outline-none"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3 flex-wrap">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-sm w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-sm w-full sm:w-auto"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
