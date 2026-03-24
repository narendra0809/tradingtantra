/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput, { AdminTextarea, AdminInputWithCopy } from "../../Components/AdminComponents/AdminInput";
import { FaDatabase, FaEdit, FaKey } from "react-icons/fa";

const DataAPI = () => {
  const [apiData, setApiData] = useState({
    token: "",
    clientId: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        setModalOpen(false);
      } catch (error) {
        console.log(error);
      }
    }
    setModalOpen(false);
  };

  const fetchDataApi = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-data-keys`, {
        withCredentials: true,
      });
      setApiData(res.data.dataKeys);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataApi();
  }, []);

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <AdminCard gradient>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FaDatabase className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Data API</h2>
                <p className="text-sm text-gray-400">Manage your API keys</p>
              </div>
            </div>
            <AdminButton variant="primary" icon={<FaEdit />} onClick={openEditModal}>
              Edit API Keys
            </AdminButton>
          </div>
        </AdminCard>

        {/* API Data Card */}
        <AdminCard>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-white/5 text-left text-xs font-semibold text-gray-400 uppercase">
                    <th className="px-6 py-4">Token</th>
                    <th className="px-6 py-4">Client ID</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-all duration-200">
                    <td className="px-6 py-4">
                      <AdminInputWithCopy
                        label=""
                        value={apiData.token || "Not set"}
                        readOnly
                        className="pointer-events-none"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <AdminInputWithCopy
                        label=""
                        value={apiData.clientId || "Not set"}
                        readOnly
                        className="pointer-events-none"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <AdminButton 
                        variant="outline" 
                        size="sm"
                        icon={<FaEdit />} 
                        onClick={openEditModal}
                      >
                        Edit
                      </AdminButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-white/10 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaDatabase className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                {isEditing ? "Edit API Keys" : "Add API Keys"}
              </h3>
            </div>
            
            <div className="space-y-4">
              <AdminTextarea
                label="Public Key / Token"
                name="token"
                value={formData.token}
                onChange={handleChange}
                placeholder="Enter your public key/token"
                rows={4}
              />
              <AdminInput
                label="Private Key / Client ID"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                placeholder="Enter your private key"
              />
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <AdminButton variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" onClick={saveData}>
                {isEditing ? "Update" : "Save"}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAPI;
