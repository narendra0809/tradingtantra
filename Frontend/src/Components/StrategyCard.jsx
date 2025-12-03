/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import VideoModal from "./VideoModal";
import { ADMIN_SERVER_URI } from "../pages/AdminPages/Home";

const StrategyCard = ({ name, title, Icon, imageSrc, imageAlt }) => {
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const [strategyVideo, setStrategyVideo] = useState(null);

  useEffect(() => {
    const fetchStrategyVideos = async () => {
      try {
        const res = await axios.get(`${ADMIN_SERVER_URI}/get-strategy`, {
          withCredentials: true,
        });
        if (res.status !== 200) throw new Error("Error while fetching videos");

        if (res.data.videos && res.data.videos.length > 0) {
          setStrategyVideo(
            res.data.videos.find((v) => v.name === name) || null
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchStrategyVideos();
  }, [name]);

  const videoUrl = strategyVideo?.videoUrl || "";

  return (
    <>
      <div className="flex justify-between items-center ">
        <div className="flex items-center gap-2">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-12 h-12 object-contain"
          />
          <div>
            <h2 className="dark:text-white text-[#01071C] text-xl font-semibold flex items-center gap-2">
              {title} {Icon && <Icon />}
            </h2>
            {videoUrl && (
              <p
                onClick={() => setOpenVideoModal(true)}
                className="dark:text-gray-400 text-sm flex items-center gap-2 cursor-pointer"
              >
                How to use{" "}
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  Live
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <VideoModal
        isOpen={openVideoModal}
        onClose={() => setOpenVideoModal(false)}
        videoUrl={videoUrl}
      />
    </>
  );
};

export default StrategyCard;
