/* eslint-disable react/prop-types */
import { Trash2 } from "lucide-react";
import { useState } from "react";

const AddValuesModal = ({ onClose, onSave }) => {
  const [sectorInput, setSectorInput] = useState("");
  const [sectors, setSectors] = useState([]);

  const [indexInput, setIndexInput] = useState("");
  const [indexes, setIndexes] = useState([]);

  const [weightageIndexName, setWeightageIndexName] = useState("");
  const [weightageValue, setWeightageValue] = useState("");
  const [weightages, setWeightages] = useState([]);

  const handleAddSector = () => {
    if (sectorInput.trim() && !sectors.includes(sectorInput.trim())) {
      setSectors([...sectors, sectorInput.trim()]);
      setSectorInput("");
    }
  };

  const handleRemoveSector = (sec) => {
    setSectors(sectors.filter((s) => s !== sec));
  };

  const handleAddIndex = () => {
    if (indexInput.trim() && !indexes.includes(indexInput.trim())) {
      setIndexes([...indexes, indexInput.trim()]);
      setIndexInput("");
    }
  };

  const handleRemoveIndex = (idx) => {
    setIndexes(indexes.filter((i) => i !== idx));
  };

  const handleAddWeightage = () => {
    if (
      weightageIndexName.trim() &&
      weightageValue.trim() &&
      !weightages.some((w) => w.indexName === weightageIndexName.trim())
    ) {
      setWeightages([
        ...weightages,
        {
          indexName: weightageIndexName.trim(),
          weightage: parseFloat(weightageValue.trim()),
        },
      ]);
      setWeightageIndexName("");
      setWeightageValue("");
    }
  };

  const handleRemoveWeightage = (indexName) => {
    setWeightages(weightages.filter((w) => w.indexName !== indexName));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ SECTOR: sectors, INDEX: indexes, weightage: weightages });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black bg-opacity-50">
      <div className="bg-[#050816] text-white max-w-2xl w-full mx-4 p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-300 text-2xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6">
          Add Sector, Index, and Weightage
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Sector Section */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">Sector</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sectorInput}
                onChange={(e) => setSectorInput(e.target.value)}
                className="flex-1 bg-[#051937] focus:outline-none p-2 rounded"
                placeholder="Enter sector name"
              />
              <button
                type="button"
                onClick={handleAddSector}
                className="bg-blue-800 hover:bg-blue-600 px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
            <ul className="flex flex-wrap gap-2 mt-2">
              {sectors.map((sec, idx) => (
                <li
                  key={idx}
                  className="bg-blue-800 p-2 rounded-md flex items-center gap-2"
                >
                  {sec}
                  <Trash2
                    width={15}
                    className="text-red-500 hover:text-red-400 cursor-pointer"
                    onClick={() => handleRemoveSector(sec)}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Index Section */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">Index</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={indexInput}
                onChange={(e) => setIndexInput(e.target.value)}
                className="flex-1 bg-[#051937] focus:outline-none p-2 rounded"
                placeholder="Enter index name"
              />
              <button
                type="button"
                onClick={handleAddIndex}
                className="bg-blue-800 hover:bg-blue-600 px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
            <ul className="flex flex-wrap gap-2 mt-2">
              {indexes.map((idx, i) => (
                <li
                  key={i}
                  className="bg-blue-800 p-2 rounded-md flex items-center gap-2"
                >
                  {idx}
                  <Trash2
                    width={15}
                    className="text-red-500 hover:text-red-400 cursor-pointer"
                    onClick={() => handleRemoveIndex(idx)}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Weightage Section */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">Weightage</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={weightageIndexName}
                onChange={(e) => setWeightageIndexName(e.target.value)}
                className="bg-[#051937] focus:outline-none p-2 rounded w-1/2"
                placeholder="Index Name"
              />
              <input
                type="number"
                value={weightageValue}
                onChange={(e) => setWeightageValue(e.target.value)}
                className="bg-[#051937] focus:outline-none p-2 rounded w-1/2"
                placeholder="Weightage Value"
              />
              <button
                type="button"
                onClick={handleAddWeightage}
                className="bg-blue-800 hover:bg-blue-600 px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
            <ul className="flex flex-wrap gap-2 mt-2">
              {weightages.map((weg, idx) => (
                <li
                  key={idx}
                  className="bg-blue-800 p-2 rounded-md flex items-center gap-2"
                >
                  {weg.indexName}: {weg.weightage}
                  <Trash2
                    width={15}
                    className="text-red-500 hover:text-red-400 cursor-pointer"
                    onClick={() => handleRemoveWeightage(weg.indexName)}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-800 hover:bg-blue-600 px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddValuesModal;
