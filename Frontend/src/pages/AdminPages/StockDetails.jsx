import { useEffect, useState, useMemo } from "react";
import StockActionsModal from "../../Components/AdminComponents/StockActionsModal";
import { ADMIN_SERVER_URI } from "./Home";
import axios from "axios";
import toast from "react-hot-toast";
import { FiTrendingUp, FiPlus, FiSearch } from "react-icons/fi";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import { AdminSearchInput } from "../../Components/AdminComponents/AdminInput";

const StockDetails = () => {
  const [stockData, setStockData] = useState([]);
  const [openModal, setModalOpen] = useState({
    value: false,
    type: null,
    data: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 15;

  const handleOpenModal = (type, data = null) => {
    setModalOpen({
      value: true,
      type,
      data,
    });
  };

  const handleCloseModal = () => {
    setModalOpen({
      value: false,
      type: null,
      data: null,
    });
  };

  const handleDeleteStock = async (id) => {
    try {
      const res = await axios.delete(`${ADMIN_SERVER_URI}/delete-stock/${id}`, {
        withCredentials: true,
      });
      if (res.status !== 201) {
        throw new Error("Unable to delete stock");
      }
      console.log(res.data);
      toast.success(res.data.message, {
        duration: 3000,
      });
      setStockData((prev) => prev.filter(({ _id }) => _id !== id));
    } catch (error) {
      toast.error(error?.message, {
        duration: 3000,
      });
      console.log(error);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await axios(`${ADMIN_SERVER_URI}/stock-detials`, {
        withCredentials: true,
      });
      setStockData(res.data?.stocks);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredStocks = useMemo(() => {
    if (!searchQuery) return stockData;
    const query = searchQuery.toLowerCase();
    return stockData.filter((stock) => {
      return (
        stock.SECURITY_ID?.toLowerCase().includes(query) ||
        stock.SYMBOL_NAME?.toLowerCase().includes(query) ||
        stock.DISPLAY_NAME?.toLowerCase().includes(query) ||
        stock.UNDERLYING_SYMBOL?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, stockData]);

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const currentStocks = filteredStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AdminCard gradient>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <FiTrendingUp className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Stock Details</h2>
                <p className="text-sm text-gray-400">Manage stock information</p>
              </div>
            </div>
            <AdminButton 
              variant="primary" 
              icon={<FiPlus />} 
              onClick={() => handleOpenModal("add")}
            >
              Add Stock
            </AdminButton>
          </div>
        </AdminCard>

        {/* Search */}
        <AdminCard padding="p-4">
          <div className="w-full md:w-1/3">
            <AdminSearchInput
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              icon={<FiSearch />}
            />
          </div>
        </AdminCard>

        {/* Table */}
        <AdminCard padding="p-0" hoverEffect={false}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Security ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Underlying Symbol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Symbol Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Display Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Sector
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Index</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Weightage
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentStocks.length > 0 ? (
                  currentStocks.map((stock) => (
                    <tr key={stock._id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        {stock.SECURITY_ID}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {stock.UNDERLYING_SYMBOL}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {stock.SYMBOL_NAME}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {stock.DISPLAY_NAME}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <ul className="list-disc list-inside">
                          {stock.SECTOR &&
                            stock.SECTOR.map((idx, index) => (
                              <li key={index}>{idx}</li>
                            ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <ul className="list-disc list-inside">
                          {stock.INDEX &&
                            stock.INDEX.map((idx, index) => (
                              <li key={index}>{idx}</li>
                            ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <ul className="list-disc list-inside">
                          {stock.weightage &&
                            stock.weightage.map((w, index) => (
                              <li key={index}>
                                {w.indexName}: {w.weightage}
                              </li>
                            ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <AdminButton 
                            variant="warning" 
                            size="sm"
                            onClick={() => handleOpenModal("edit", stock)}
                          >
                            Edit
                          </AdminButton>
                          <AdminButton 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteStock(stock._id)}
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-sm text-gray-400"
                    >
                      No stocks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2 p-4 border-t border-white/5">
              <AdminButton 
                variant="secondary" 
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Prev
              </AdminButton>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <AdminButton
                    key={page}
                    variant={page === currentPage ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </AdminButton>
                ))}
              </div>
              <AdminButton 
                variant="secondary" 
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </AdminButton>
            </div>
          )}
        </AdminCard>
      </div>

      {/* Modal */}
      {openModal.value && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl">
          <div className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6 border border-white/10">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-lg">✕</span>
            </button>
            <StockActionsModal
              type={openModal.type}
              onClose={handleCloseModal}
              stockData={openModal.data}
              setStockData={setStockData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetails;
