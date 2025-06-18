import { useEffect, useState } from "react";
// import vthumb from "../../assets/adminImages/homapage/our.png";
import { FiEdit, FiTrash2, FiXCircle } from "react-icons/fi";
import axios from "axios";
import { ADMIN_SERVER_URI } from "./Home";

export default function OurStrategyAdmin() {
  const [videos, setVideos] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    _id: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const openAddModal = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      _id: "",
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    setFormData({
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
    const { title, description, videoUrl, thumbnailUrl } = formData;
    if (
      !title.trim() ||
      !videoUrl.trim() ||
      !description.trim() ||
      !thumbnailUrl.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const newVideo = { ...formData };
      if (isEditing) {
        const res = await axios.put(
          `${ADMIN_SERVER_URI}/edit-strategy`,
          newVideo,
          { withCredentials: true }
        );
        if (res.status !== 200) {
          throw new Error("Error while saving video !");
        }
        fetchVideos();
      } else {
        const res = await axios.post(
          `${ADMIN_SERVER_URI}/post-strategy`,
          newVideo,
          { withCredentials: true }
        );
        if (res.status !== 200) {
          throw new Error("Error while saving video !");
        }
        fetchVideos();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setModalOpen(false);
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
    <div className="bg-[#000A2D] text-white min-h-screen p-6 sm:p-10">
      <h2 className="text-2xl font-semibold mb-6">Our Strategy</h2>

      <div className="bg-[#101223] rounded-xl p-5 overflow-x-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white"
          >
            Add Video
          </button>
        </div>

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
      </div>

      {/* Modal */}
      {modalOpen && (
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
      )}
    </div>
  );
}
