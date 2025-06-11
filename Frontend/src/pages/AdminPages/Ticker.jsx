import { useEffect, useRef, useState } from "react";
import { FaTrashAlt, FaEdit, FaSearch } from "react-icons/fa";

const Ticker = () => {
  const [tickers, setTickers] = useState([
    { symbol: "SBIN", price: 793.5, change: -7.55, percent: -0.94 },
    { symbol: "TCS", price: 3560.2, change: 12.3, percent: 0.35 },
  ]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formText, setFormText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const inputRef = useRef(null);

  const openModal = (index = null) => {
    if (index !== null) {
      const t = tickers[index];
      setFormText(`${t.symbol} - ${t.price} ${t.change}(${t.percent}%)`);
      setEditingIndex(index);
    } else {
      setFormText("");
      setEditingIndex(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormText("");
    setEditingIndex(null);
  };

  const parseTickerText = (text) => {
    try {
      const [symbolPart, rest] = text.split(" - ");
      const [price, changeAndPercent] = rest.split(" ");
      const change = parseFloat(changeAndPercent.split("(")[0]);
      const percent = parseFloat(
        changeAndPercent.split("(")[1].replace("%)", "")
      );
      return {
        symbol: symbolPart,
        price: parseFloat(price),
        change,
        percent,
      };
    } catch {
      return null;
    }
  };

  const handleSubmit = () => {
    const parsed = parseTickerText(formText.trim());
    if (!parsed)
      return alert("Invalid format. Try: SBIN - 793.50 -7.55(-0.94%)");

    if (editingIndex !== null) {
      const updated = [...tickers];
      updated[editingIndex] = parsed;
      setTickers(updated);
    } else {
      setTickers([...tickers, parsed]);
    }
    closeModal();
  };

  const deleteTicker = (index) => {
    if (window.confirm("Are you sure you want to delete this ticker?")) {
      setTickers(tickers.filter((_, i) => i !== index));
    }
  };

  const filteredTickers = tickers.filter((t) =>
    t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (modalOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [modalOpen]);

  return (
    <div className="min-h-screen bg-[#01071C] text-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Ticker</h2>
        <div className="flex flex-col sm:flex-row items-start  sm:items-center gap-3">
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
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-semibold w-96 sm:w-auto  "
            onClick={() => openModal()}
          >
            Add Ticker ↗
          </button>
        </div>
      </div>

      {/* Ticker List */}
      <div className="bg-[#0B132B] rounded-xl border border-gray-800 overflow-x-auto">
        <div className="p-4 font-semibold text-sm text-gray-400 whitespace-nowrap">
          Ticker & Symbol Name
        </div>

        {filteredTickers.length === 0 && (
          <p className="text-center text-gray-500 p-6">No tickers found.</p>
        )}

        {filteredTickers.map((ticker, index) => (
          <div
            key={index}
            className="px-4 py-4 border-t border-gray-800 min-w-[360px]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                  {ticker.symbol.charAt(0)}
                </div>
                <span className="text-sm sm:text-base font-semibold">
                  {ticker.symbol}
                </span>
                <span className="text-sm sm:text-base text-green-400">
                  - {ticker.price.toFixed(2)}
                </span>
                <span
                  className={`text-sm sm:text-base ${
                    ticker.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {ticker.change.toFixed(2)} ({ticker.percent.toFixed(2)}%)
                </span>
              </div>
              <div className="flex gap-4 text-lg mt-2 sm:mt-0">
                <FaEdit
                  onClick={() => openModal(index)}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer"
                />
                <FaTrashAlt
                  onClick={() => deleteTicker(index)}
                  className="text-red-500 hover:text-red-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 overflow-auto">
          <div className="min-h-screen flex items-center justify-center px-4 py-10">
            <div className="bg-[#071540] text-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-bold text-center mb-6">
                {editingIndex !== null ? "Edit Ticker" : "Add Ticker"}
              </h3>

              <label className="text-sm text-blue-400">
                Fill Ticker Content
              </label>
              <input
                ref={inputRef}
                type="text"
                placeholder="SBIN - 793.50 -7.55(-0.94%)"
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                className="w-full mt-2 p-3 bg-transparent border border-blue-500 rounded-lg text-white outline-none placeholder-gray-400"
              />

              {/* Upload Icon Section */}
              <div className="flex flex-col items-center my-6">
                <div className="border-2 border-dashed border-white rounded-md w-12 h-12 flex items-center justify-center text-2xl">
                  +
                </div>
                <p className="text-sm mt-2 mb-2 text-gray-300">
                  Choose Your Icon to upload
                </p>
                <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm">
                  Browse File
                </button>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-md text-lg font-semibold"
              >
                Submit Ticker
              </button>

              <button
                onClick={closeModal}
                className="w-full text-gray-400 hover:text-white text-sm mt-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticker;
