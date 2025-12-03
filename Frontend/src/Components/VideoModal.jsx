/* eslint-disable react/prop-types */
const toYoutubeEmbedUrl = (url) => {
  if (!url) return "";

  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "m.youtube.com"
    ) {
      const id = u.searchParams.get("v");
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }
    return url;
  } catch {
    return url;
  }
};

const VideoModal = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;
  const convertedUrl = toYoutubeEmbedUrl(videoUrl);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-[90vw] max-w-4xl bg-white border-[4.46px] border-[#0256F5] rounded-xl shadow-xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-1 top-1 text-red-600 hover:text-red-900"
          aria-label="Close video"
          title="Close"
        >
          ✕
        </button>

        <div
          onContextMenu={(e) => e.preventDefault()}
          className="aspect-video w-full bg-black"
        >
          <iframe
            className="w-full h-full"
            src={convertedUrl}
            title="TradingTantra Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
