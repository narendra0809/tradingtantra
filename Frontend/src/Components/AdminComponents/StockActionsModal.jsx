/* eslint-disable react/prop-types */
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ADMIN_SERVER_URI } from "../../pages/AdminPages/Home";
import toast from "react-hot-toast";

const StockActionsModal = ({ type, onClose, stockData, setStockData }) => {
  let initialData = {
    _id: "",
    SECURITY_ID: "",
    UNDERLYING_SYMBOL: "",
    SYMBOL_NAME: "",
    DISPLAY_NAME: "",
    SECTOR: [],
    INDEX: [],
    weightage: [],
  };
  if (type === "edit") {
    initialData = stockData;
  }
  const [formData, setFormData] = useState(initialData);

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [showWeightageModal, setShowWeightageModal] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddSector = (newSector) => {
    if (newSector && !formData.SECTOR.includes(newSector)) {
      setFormData((prev) => ({ ...prev, SECTOR: [...prev.SECTOR, newSector] }));
    }
    setShowSectorModal(false);
  };

  const handleRemoveSector = (sec) => {
    setFormData((prev) => ({
      ...prev,
      SECTOR: prev.SECTOR.filter((s) => s !== sec),
    }));
  };

  const handleAddIndex = (newIndex) => {
    if (newIndex && !formData.INDEX.includes(newIndex)) {
      setFormData((prev) => ({ ...prev, INDEX: [...prev.INDEX, newIndex] }));
    }
    setShowIndexModal(false);
  };

  const handleRemoveIndex = (idx) => {
    setFormData((prev) => ({
      ...prev,
      INDEX: prev.INDEX.filter((i) => i !== idx),
    }));
  };

  const handleAddWeightage = (indexName, weightageValue) => {
    if (
      indexName &&
      weightageValue &&
      !formData.weightage.some((w) => w.indexName === indexName)
    ) {
      setFormData((prev) => ({
        ...prev,
        weightage: [
          ...prev.weightage,
          { indexName, weightage: parseFloat(weightageValue) },
        ],
      }));
    }
    setShowWeightageModal(false);
  };

  const handleRemoveWeightage = (indexName) => {
    setFormData((prev) => ({
      ...prev,
      weightage: prev.weightage.filter((w) => w.indexName !== indexName),
    }));
  };

  const handleAddStock = async () => {
    try {
      const response = await axios.post(
        `${ADMIN_SERVER_URI}/add-stock`,
        {
          SECURITY_ID: formData.SECURITY_ID,
          UNDERLYING_SYMBOL: formData.UNDERLYING_SYMBOL,
          SYMBOL_NAME: formData.SYMBOL_NAME,
          DISPLAY_NAME: formData.DISPLAY_NAME,
          SECTOR: formData.SECTOR,
          INDEX: formData.INDEX,
          weightage: formData.weightage,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status !== 201) {
        throw new Error("Unable to add stock.");
      }
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const handleUpdateStock = async () => {
    try {
      if (!formData._id) {
        throw new Error("Id not found !");
      }
      const response = await axios.patch(
        `${ADMIN_SERVER_URI}/update-stock/${formData._id}`,
        formData,
        {
          withCredentials: true,
        }
      );
      if (response.status !== 201) {
        throw new Error("Unable to update stock");
      }
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let data = null;
    if (type === "edit") {
      data = await handleUpdateStock();
    } else {
      data = await handleAddStock();
    }
    toast.success(data.message, {
      duration: 3000,
    });
    setStockData((prev) => {
      let found = prev.find(({ _id }) => data.stock._id === _id);
      if (!found) {
        return [...prev, data.stock];
      }
      return prev.map((stk) => (stk._id === found._id ? data.stock : stk));
    });
    onClose();
  };

  return (
    <div className="p-4 bg-[#050816] text-white max-w-2xl mx-auto rounded-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="SECURITY_ID" className="text-lg font-semibold">
            Security ID
          </label>
          <input
            type="text"
            id="SECURITY_ID"
            value={formData.SECURITY_ID}
            onChange={handleChange}
            className="bg-[#051937] focus-visible:outline-none p-2"
            placeholder="Enter security Id"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="UNDERLYING_SYMBOL" className="text-lg font-semibold">
            Underlying Symbol
          </label>
          <input
            type="text"
            id="UNDERLYING_SYMBOL"
            value={formData.UNDERLYING_SYMBOL}
            onChange={handleChange}
            className="bg-[#051937] focus-visible:outline-none p-2"
            placeholder="Enter underlying symbol"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="SYMBOL_NAME" className="text-lg font-semibold">
            Symbol Name
          </label>
          <input
            type="text"
            value={formData.SYMBOL_NAME}
            onChange={handleChange}
            id="SYMBOL_NAME"
            className="bg-[#051937] focus-visible:outline-none p-2"
            placeholder="Enter symbol name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="DISPLAY_NAME" className="text-lg font-semibold">
            Display Name
          </label>
          <input
            type="text"
            value={formData.DISPLAY_NAME}
            onChange={handleChange}
            id="DISPLAY_NAME"
            className="bg-[#051937] focus-visible:outline-none p-2"
            placeholder="Enter display name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-lg font-semibold">Sector</label>
            <button
              type="button"
              onClick={() => setShowSectorModal(true)}
              className="rounded-lg p-2 bg-blue-800 hover:bg-blue-600"
            >
              Add Sector
            </button>
          </div>
          <ul className="relative flex flex-wrap gap-2">
            {formData.SECTOR &&
              formData.SECTOR.map((sec, idx) => (
                <li className="bg-blue-800 p-3 rounded-md" key={idx}>
                  {sec}
                  <span className="absolute -top-1 cursor-pointer">
                    <Trash2
                      width={15}
                      className="text-red-500 hover:text-red-400"
                      onClick={() => handleRemoveSector(sec)}
                    />
                  </span>
                </li>
              ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-lg font-semibold">Index</label>
            <button
              type="button"
              onClick={() => setShowIndexModal(true)}
              className="rounded-lg p-2 bg-blue-800 hover:bg-blue-600"
            >
              Add Index
            </button>
          </div>
          <ul className="relative flex flex-wrap gap-2">
            {formData.INDEX &&
              formData.INDEX.map((index, idx) => (
                <li className="bg-blue-800 p-3 rounded-md" key={idx}>
                  {index}
                  <span className="absolute -top-1 cursor-pointer">
                    <Trash2
                      width={15}
                      className="text-red-500 hover:text-red-400"
                      onClick={() => handleRemoveIndex(index)}
                    />
                  </span>
                </li>
              ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-lg font-semibold">Weightage</label>
            <button
              type="button"
              onClick={() => setShowWeightageModal(true)}
              className="rounded-lg p-2 bg-blue-800 hover:bg-blue-600"
            >
              Add Weightage
            </button>
          </div>
          <ul className="relative flex flex-wrap gap-2">
            {formData.weightage &&
              formData.weightage.map((weg, idx) => (
                <li className="bg-blue-800 p-3 rounded-md" key={idx}>
                  <span>
                    {weg.indexName} : {weg.weightage}
                  </span>
                  <span className="absolute -top-1 cursor-pointer">
                    <Trash2
                      width={15}
                      className="text-red-500 hover:text-red-400"
                      onClick={() => handleRemoveWeightage(weg.indexName)}
                    />
                  </span>
                </li>
              ))}
          </ul>
        </div>
        <button
          type="submit"
          className="bg-blue-800 text-xl p-1 rounded-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </form>

      {/* Small Modal for Adding Sector */}
      {showSectorModal && (
        <SmallInputModal
          label="Add Sector"
          placeholder="Enter sector name"
          onAdd={(value) => handleAddSector(value)}
          onCancel={() => setShowSectorModal(false)}
        />
      )}

      {showIndexModal && (
        <SmallInputModal
          label="Add Index"
          placeholder="Enter index name"
          onAdd={(value) => handleAddIndex(value)}
          onCancel={() => setShowIndexModal(false)}
        />
      )}

      {showWeightageModal && (
        <SmallWeightageModal
          onAdd={handleAddWeightage}
          onCancel={() => setShowWeightageModal(false)}
        />
      )}
    </div>
  );
};

const SmallInputModal = ({ label, placeholder, onAdd, onCancel }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-lg">
      <div className="bg-[#050816] p-4 rounded-lg shadow-lg w-80 text-white">
        <h3 className="text-lg font-semibold mb-2">{label}</h3>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#051937] focus:outline-none p-2 rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-800 hover:bg-blue-600 px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

const SmallWeightageModal = ({ onAdd, onCancel }) => {
  const [indexName, setIndexName] = useState("");
  const [weightageValue, setWeightageValue] = useState("");

  const handleAdd = () => {
    if (indexName.trim() && weightageValue.trim()) {
      onAdd(indexName.trim(), weightageValue.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-lg">
      <div className="bg-[#050816] p-4 rounded-lg shadow-lg w-80 text-white">
        <h3 className="text-lg font-semibold mb-2">Add Weightage</h3>
        <input
          type="text"
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
          placeholder="Enter index name"
          className="w-full bg-[#051937] focus:outline-none p-2 rounded mb-2"
        />
        <input
          type="text"
          value={weightageValue}
          onChange={(e) => setWeightageValue(e.target.value)}
          placeholder="Enter weightage value"
          className="w-full bg-[#051937] focus:outline-none p-2 rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-800 hover:bg-blue-600 px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockActionsModal;
