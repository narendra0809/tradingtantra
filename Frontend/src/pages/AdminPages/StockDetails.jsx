import { useEffect, useState, useMemo } from "react";
import StockActionsModal from "../../Components/AdminComponents/StockActionsModal";
import { ADMIN_SERVER_URI } from "./Home";
import axios from "axios";
import toast from "react-hot-toast";

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
    <div className="p-4 bg-[#050816] min-h-screen text-white">
      <div className="flex justify-between my-7">
        <h1 className="text-3xl font-bold">Stock Details</h1>
        <button
          onClick={() => handleOpenModal("add")}
          className="font-semibold hover:bg-blue-600 border border-blue-400 bg-blue-700 rounded-lg p-2"
        >
          Add Stock
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="p-2 rounded bg-[#051937] text-white w-full md:w-1/3 focus:outline-none"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#050816] border border-gray-700 rounded-lg shadow-md table-auto">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Security ID
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Underlying Symbol
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Symbol Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Display Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Sector
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">Index</th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Weightage
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentStocks.length > 0 ? (
              currentStocks.map((stock) => (
                <tr key={stock._id} className="hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm border-t border-gray-700">
                    {stock.SECURITY_ID}
                  </td>
                  <td className="px-4 py-2 text-sm border-t border-gray-700">
                    {stock.UNDERLYING_SYMBOL}
                  </td>
                  <td className="px-4 py-2 text-sm border-t border-gray-700">
                    {stock.SYMBOL_NAME}
                  </td>
                  <td className="px-4 py-2 text-sm border-t border-gray-700">
                    {stock.DISPLAY_NAME}
                  </td>
                  <td className="px-4 py-2 text-sm border-t border-gray-700">
                    <ul className="list-disc list-inside">
                      {stock.SECTOR &&
                        stock.SECTOR.map((idx, index) => (
                          <li key={index}>{idx}</li>
                        ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 text-sm border-t border-gray-700">
                    <ul className="list-disc list-inside">
                      {stock.INDEX &&
                        stock.INDEX.map((idx, index) => (
                          <li key={index}>{idx}</li>
                        ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 text-sm border-t border-gray-700">
                    <ul className="list-disc list-inside">
                      {stock.weightage &&
                        stock.weightage.map((w, index) => (
                          <li key={index}>
                            {w.indexName}: {w.weightage}
                          </li>
                        ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 text-sm border-t border-gray-700">
                    <button
                      onClick={() => handleOpenModal("edit", stock)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-500 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStock(stock._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-2 text-center text-sm text-gray-400"
                >
                  No stocks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <>
          {/* Mobile Pagination (visible on small screens) */}
          <div className="flex justify-center mt-4 gap-2 lg:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
            >
              Prev
            </button>
            <span className="px-3 py-1 rounded bg-blue-900 flex items-center">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
            >
              Next
            </button>
          </div>

          {/* Desktop Pagination (visible on medium and larger screens) */}
          <div className="hidden lg:flex justify-center mt-4 gap-2 overflow-x-auto">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  page === currentPage
                    ? "bg-blue-900"
                    : "bg-blue-700 hover:bg-blue-600"
                } whitespace-nowrap`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
            >
              Next
            </button>
          </div>
        </>
      )}

      {openModal.value && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl">
          <div className="relative bg-[#050816] rounded-lg shadow-lg max-w-2xl w-full mx-4 p-4">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-white hover:text-gray-300"
            >
              <span className="text-lg">X</span>
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
