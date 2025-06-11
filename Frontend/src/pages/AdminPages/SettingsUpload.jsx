/* eslint-disable react/prop-types */
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import logo from "../../assets/adminImages/logo.png";

const UploadCard = ({ title, size, image, onUpload, onRemove }) => {
  const [preview, setPreview] = useState(image || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onUpload(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file.");
    }
  };

  const handleRemove = () => {
    setPreview(logo); // fallback to default
    onRemove();
  };

  return (
    <div
      className="rounded-xl w-full max-w-sm flex flex-col sm:flex-row items-center sm:items-start p-4 gap-4 shadow-md h-auto sm:h-[140px]"
      style={{ background: "rgba(1, 7, 28, 1)" }}
    >
      {/* Image Preview */}
      <div className="bg-[#040724] rounded-xl w-full h-32 sm:w-1/2 sm:h-full flex items-center justify-center overflow-hidden">
        <img
          src={preview || logo}
          alt={`${title} preview`}
          className="object-contain w-full h-full"
        />
      </div>

      {/* Right: Info + Buttons */}
      <div className="flex flex-col justify-between h-full w-full">
        <div>
          <h3 className="text-white text-md font-semibold leading-tight">
            {title} Change
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Size: {size} Width * Height
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <label
            htmlFor={`${title}-file-input`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-md cursor-pointer"
          >
            Upload
          </label>
          {preview && preview !== logo && (
            <button
              onClick={handleRemove}
              className="text-white hover:text-red-500 text-sm flex items-center gap-1"
            >
              <FiTrash2 size={16} /> Remove
            </button>
          )}
        </div>

        <input
          type="file"
          id={`${title}-file-input`}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default function SettingsUpload() {
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);

  return (
    <div className="bg-[#00010f] min-h-screen p-4 sm:p-6 flex flex-col items-start md:items-start gap-6 sm:gap-12 md:flex-row md:justify-center">
      <UploadCard
        title="Logo"
        size="194 * 53"
        image={logo}
        onUpload={(img) => setLogo(img)}
        onRemove={() => setLogo(null)}
      />
      <UploadCard
        title="Favicon"
        size="194 * 53"
        image={favicon}
        onUpload={(img) => setFavicon(img)}
        onRemove={() => setFavicon(null)}
      />
    </div>
  );
}
