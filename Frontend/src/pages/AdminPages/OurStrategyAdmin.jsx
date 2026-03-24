import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiXCircle, FiPlus } from "react-icons/fi";
import { FaLightbulb } from "react-icons/fa";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";
import AdminCard from "../../Components/AdminComponents/AdminCard";
import AdminButton from "../../Components/AdminComponents/AdminButton";
import AdminInput, { AdminTextarea } from "../../Components/AdminComponents/AdminInput";

const OPTION_NAME_OPTIONS = [
  { label: "Option Insider", value: "option-insider" },
  { label: "Option Data", value: "option-data" },
  { label: "Option Clock", value: "option-clock" },
  { label: "Index Depth", value: "index-depth" },
  { label: "Large Cap Power Stocks", value: "large-cap-power-stocks" },
  { label: "Intraday Boom", value: "intraday-boom" },
  { label: "Day High Break", value: "day-high-break" },
  { label: "Day Low Break", value: "day-low-break" },
  { label: "Top Gainers", value: "top-gainers" },
  { label: "Top Loosers", value: "top-loosers" },
  { label: "Sector Depth Grid", value: "sector-depth-grid" },
  { label: "Sector Depth Chart", value: "sector-depth-chart" },
  { label: "Sector Depth Nifty", value: "sector-depth-nifty" },
  { label: "Sector Depth Sensex", value: "sector-depth-sensex" },
  { label: "Sector Depth Bank", value: "sector-depth-bank" },
  { label: "Sector Depth Energy", value: "sector-depth-energy" },
  { label: "Sector Depth Finserv", value: "sector-depth-finserv" },
  { label: "Sector Depth Pvt Bank", value: "sector-depth-pvt-bank" },
  { label: "Sector Depth Auto", value: "sector-depth-auto" },
  { label: "Sector Depth Nifty Mid", value: "sector-depth-nifty-mid" },
  { label: "Sector Depth Pharma", value: "sector-depth-pharma" },
  { label: "Sector Depth FMCG", value: "sector-depth-fmcg" },
  { label: "Sector Depth Metal", value: "sector-depth-metal" },
  { label: "Sector Depth Cement", value: "sector-depth-cement" },
  { label: "Sector Depth Realty", value: "sector-depth-realty" },
  { label: "Sector Depth IT", value: "sector-depth-it" },
  { label: "Sector Depth PSU Bank", value: "sector-depth-psu-bank" },
  { label: "5 Day BO", value: "five-day-bo" },
  { label: "10 Day BO", value: "ten-day-bo" },
  { label: "Candle Reversal", value: "candle-reversal" },
  { label: "Channel Breakers", value: "channel-breakers" },
  { label: "Contraction", value: "contraction" },
  { label: "Momentum Catcher 5 Min", value: "momentum-catcher-five" },
  { label: "Momentum Catcher 10 Min", value: "momentum-catcher-ten" },
  { label: "Intraday Reversal", value: "intraday-reversal" },
  { label: "Swing Reversal", value: "swing-reversal" },
  { label: "Range Breakout", value: "range-breakout" },
  { label: "DAY H/L Reversal", value: "day-hl-reversal" },
  { label: "2 DAY H/L Break", value: "two-day-hl-break" },
  { label: "FII/DII", value: "fii-dii" },
];

export default function OurStrategyAdmin() {
  const [videos, setVideos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    _id: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [useVideoUrl, setUseVideoUrl] = useState(true);
  const [useThumbnailUrl, setUseThumbnailUrl] = useState(true);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const openAddModal = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      _id: "",
      name: "",
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    setFormData({
      name: videos[index].name,
      title: videos[index].title,
      description: videos[index].description,
      videoUrl: videos[index].videoUrl,
      thumbnailUrl: videos[index].thumbnailUrl,
      _id: videos[index]._id,
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${ADMIN_SERVER_URI}/get-strategy`, {
        withCredentials: true,
      });
      if (res.status !== 200) {
        throw new Error("Error while fetching videos");
      }
      setVideos(res.data.videos);
    } catch (error) {
      console.log(error);
    }
  };

  const saveVideo = async () => {
    const { title, description, videoUrl, thumbnailUrl, name } = formData;
    if (
      !title.trim() ||
      !description.trim() ||
      !name.trim() ||
      (!videoUrl && !videoFile) ||
      (!thumbnailUrl && !thumbnailFile)
    ) {
      alert("Please fill in all fields.");
      return;
    }
    const newVideo = new FormData();
    newVideo.append("title", title);
    newVideo.append("name", name);
    newVideo.append("description", description);
    newVideo.append("videoUrl", videoUrl);
    newVideo.append("thumbnailUrl", thumbnailUrl);
    newVideo.append("thumbnailFile", thumbnailFile);
    newVideo.append("videoFile", videoFile);
    try {
      if (isEditing) {
        const res = await axios.put(
          `${ADMIN_SERVER_URI}/edit-strategy`,
          newVideo,
          {
            withCredentials: true,
          }
        );
        if (res.status !== 201) {
          throw new Error("Error while saving video !");
        }
        fetchVideos();
      } else {
        const res = await axios.post(
          `${ADMIN_SERVER_URI}/post-strategy`,
          newVideo,
          {
            withCredentials: true,
          }
        );
        if (res.status !== 201) {
          throw new Error("Error while saving video !");
        }
        fetchVideos();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setModalOpen(false);
      setThumbnailFile(null);
      setVideoFile(null);
    }
  };

  const deleteVideo = async (id) => {
    try {
      await axios.delete(`${ADMIN_SERVER_URI}/delete-strategy?id=${id}`, {
        withCredentials: true,
      });
      fetchVideos();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 bg-[#000A2D]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AdminCard gradient>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <FaLightbulb className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Our Strategy</h2>
                <p className="text-sm text-gray-400">Manage strategy videos</p>
              </div>
            </div>
            <AdminButton variant="primary" icon={<FiPlus />} onClick={openAddModal}>
              Add Video
            </AdminButton>
          </div>
        </AdminCard>

        {/* Table */}
        <AdminCard padding="p-0" hoverEffect={false}>
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="text-blue-400 border-b border-blue-900">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Video Url</th>
                <th className="py-3 px-4">Thumbnail Url</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 px-2 text-center text-gray-400">
                  No vidoes found.
                </td>
              </tr>
            ) : (
              videos.map((video, index) => (
                <tr key={index} className="border-b border-blue-900">
                  <td className="py-3 px-4">{video.title}</td>
                  <td className="py-3 px-4">{video.description}</td>
                  <td className="py-3 px-4 break-all text-blue-300">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {video.videoUrl}
                    </a>
                  </td>
                  <td className="py-3 px-4 break-all text-blue-300">
                    <a
                      href={video.thumbnailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {video.thumbnailUrl}
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(index)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => deleteVideo(video._id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminCard>

      {/* Modal */}
      {/* {modalOpen && (
        <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#030B2B] text-white p-6 rounded-2xl w-full max-w-md">
            <div className="flex justify-end items-center gap-35">
              <h3 className="text-xl font-semibold">
                {isEditing ? "Edit Video" : "Add Video"}
              </h3>
              <FiXCircle
                onClick={() => setModalOpen(false)}
                className="text-2xl hover:cursor-pointer"
              />
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-blue-400 text-sm">Name</label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 rounded-md bg-transparent border border-blue-400 text-white outline-none"
                >
                  <option value="" className="bg-[#030B2B]">
                    Select option
                  </option>
                  {OPTION_NAME_OPTIONS.map(({ label, value }) => (
                    <option key={value} value={value} className="bg-[#030B2B]">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-blue-400 text-sm">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter Video Title"
                  className="w-full mt-1 px-4 py-2 rounded-md bg-transparent border border-blue-400 placeholder-blue-300 outline-none"
                />
              </div>
              <div>
                <label className="text-blue-400 text-sm">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter Video Title"
                  className="w-full mt-1 px-4 py-2 rounded-md bg-transparent border border-blue-400 placeholder-blue-300 outline-none"
                />
              </div>
              <div>
                <label className="text-blue-400 text-sm">Video Url</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="Enter Video Link"
                  className="w-full mt-1 px-4 py-2 rounded-md bg-transparent border border-blue-400 placeholder-blue-300 outline-none"
                />
              </div>
              <div>
                <label className="text-blue-400 text-sm">Thumbnail Url</label>
                <input
                  type="text"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleChange}
                  placeholder="Enter Video Link"
                  className="w-full mt-1 px-4 py-2 rounded-md bg-transparent border border-blue-400 placeholder-blue-300 outline-none"
                />
              </div>
              <button
                onClick={saveVideo}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-medium"
              >
                Submit Video
              </button>
            </div>
          </div>
        </div>
      )} */}
      {modalOpen && (
        <div className="fixed inset-0 backdrop-blur-2xl bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0f172a] text-white p-6 rounded-2xl w-full max-w-lg border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {isEditing ? "Edit Video" : "Add Video"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Name select */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Name</label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white rounded-xl outline-none transition-all duration-300 border border-white/10 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 py-3 px-4 hover:border-white/20"
                >
                  <option value="" className="bg-[#0f172a]">Select option</option>
                  {OPTION_NAME_OPTIONS.map(({ label, value }) => (
                    <option key={value} value={value} className="bg-[#0f172a]">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <AdminInput
                label="Title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Video Title"
              />

              {/* Description */}
              <AdminTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Video Description"
                rows={3}
              />

              {/* Video: toggle URL / file */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-blue-400 text-sm">Video</label>
                  <label className="flex items-center gap-2 text-xs text-blue-300">
                    <input
                      type="checkbox"
                      checked={useVideoUrl}
                      onChange={(e) => setUseVideoUrl(e.target.checked)}
                    />
                    Upload via URL
                  </label>
                </div>

                {useVideoUrl ? (
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="Enter Video Link"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-transparent border border-blue-400 placeholder-blue-300 outline-none"
                  />
                ) : (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full mt-1 px-3 py-2 rounded-md bg-[#020617] border border-blue-400 text-xs file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white"
                  />
                )}
              </div>

              {/* Thumbnail: toggle URL / file */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-blue-400 text-sm">Thumbnail</label>
                  <label className="flex items-center gap-2 text-xs text-blue-300">
                    <input
                      type="checkbox"
                      checked={useThumbnailUrl}
                      onChange={(e) => setUseThumbnailUrl(e.target.checked)}
                    />
                    Upload via URL
                  </label>
                </div>

                {useThumbnailUrl ? (
                  <input
                    type="text"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                    placeholder="Enter Thumbnail Link"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-transparent border border-blue-400 placeholder-blue-300 outline-none"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setThumbnailFile(e.target.files?.[0] || null)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-md bg-[#020617] border border-blue-400 text-xs file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white"
                  />
                )}
              </div>

              <button
                onClick={saveVideo}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-medium"
              >
                Submit Video
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    );
  }
