// import React, { useState, useRef } from "react";
// import { FiUser, FiMail, FiTrash2, FiLock } from "react-icons/fi";
// import { HiOutlineCloudUpload } from "react-icons/hi";
// import profileImg from "../assets/myprofile/Ellipse.png";
// import bgImage from "../assets/myprofile/image1.png";
// import img from "../assets/myprofile/upload.png";
// import ResetPasswordModal from "../components/ResetPasswordModal"; // ✅ import the modal

// export default function Profile() {
//   const [formData, setFormData] = useState({
//     firstName: "John",
//     lastName: "Carter",
//     email: "example@yourmail.com",
//     photo: profileImg,
//   });

//   const [showResetModal, setShowResetModal] = useState(false);

//   const handleChangePassword = () => {
//     setShowResetModal(true); // ✅ open modal
//   };
//   const fileInputRef = useRef(null);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleUploadClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageURL = URL.createObjectURL(file);
//       setFormData((prev) => ({ ...prev, photo: imageURL }));
//     }
//   };

//   const handleDeletePhoto = () => {
//     setFormData((prev) => ({ ...prev, photo: "" }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert(
//       "Profile Updated Successfully!\n" + JSON.stringify(formData, null, 2)
//     );
//   };

//   return (
//     <div className="bg-[#0D0F1C] min-h-screen text-white">
//       {/* Header */}
//       <div
//         className="relative w-full h-24 rounded-b-xl"
//         style={{
//           backgroundImage: `url(${bgImage})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         <div className="absolute bottom-[-30px] left-6 flex items-center gap-4">
//           <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#0D0F1C]">
//             <img
//               src={formData.photo}
//               alt="Profile"
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <h2 className="text-2xl font-semibold">JuliusCesar1014</h2>
//         </div>
//         <button
//           onClick={handleChangePassword}
//           className="absolute top-32 right-6 bg-[#1A1D2E] border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
//         >
//           <FiLock /> Change Password
//         </button>
//       </div>
//       {showResetModal && (
//         <ResetPasswordModal onClose={() => setShowResetModal(false)} />
//       )}
//       {/* Form */}
//       <form
//         onSubmit={handleSubmit}
//         className="bg-[#101223] mt-20 mx-auto rounded-xl p-6 max-w-2xl"
//       >
//         <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
//           <FiUser /> Account
//         </h2>
//         <p className="text-sm text-gray-400 mb-6">
//           Lorem ipsum dolor sit amet consectetur sit mauris nec morbi nisi.
//         </p>

//         <div className="text-sm text-gray-400 mb-4">
//           Lorem ipsum dolor sit amet consectetur quisque nisi eget mi libero leo
//           vel claim in.
//         </div>

//         <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="relative">
//             <label className="block text-sm mb-1" htmlFor="firstName">
//               First name
//             </label>
//             <FiUser className="absolute top-10 left-3 text-gray-400" />
//             <input
//               id="firstName"
//               name="firstName"
//               type="text"
//               value={formData.firstName}
//               onChange={handleChange}
//               className="w-full bg-[#1A1D2E] border-none rounded-md pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
//             />
//           </div>
//           <div className="relative">
//             <label className="block text-sm mb-1" htmlFor="lastName">
//               Last name
//             </label>
//             <FiUser className="absolute top-10 left-3 text-gray-400" />
//             <input
//               id="lastName"
//               name="lastName"
//               type="text"
//               value={formData.lastName}
//               onChange={handleChange}
//               className="w-full bg-[#1A1D2E] border-none rounded-md pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
//             />
//           </div>
//         </div>

//         <div className="mb-4 relative">
//           <label className="block text-sm mb-1" htmlFor="email">
//             Email address
//           </label>
//           <FiMail className="absolute top-10 left-3 text-gray-400" />
//           <input
//             id="email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full bg-[#1A1D2E] border-none rounded-md pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />
//         </div>

//         {/* Photo upload section */}
//         <div className="mb-6 flex items-start justify-center gap-10">
//           <label className="block text-sm mb-1">Photo</label>
//           <div className="flex flex-col items-center gap-2">
//             <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 shrink-0">
//               {formData.photo ? (
//                 <img
//                   src={formData.photo}
//                   alt="Profile"
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-gray-400">
//                   No Img
//                 </div>
//               )}
//             </div>
//             <div className="flex flex-col gap-2">
//               <button
//                 type="button"
//                 onClick={handleDeletePhoto}
//                 className="text-blue-600 text-sm hover:text-red-500 w-fit flex items-center gap-1"
//               >
//                 <FiTrash2 /> Delete
//               </button>
//             </div>
//           </div>

//           <div>
//             <div
//               className="border border-dashed border-gray-600 rounded-lg p-5 text-center text-sm text-gray-400 cursor-pointer max-w-md flex flex-col items-center gap-2"
//               onClick={handleUploadClick}
//               style={{ background: "rgba(21, 27, 45, 1)" }}
//             >
//               <img
//                 src={img}
//                 alt="image uploading icons"
//                 className="w-12 h-12 rounded-full"
//               />
//               <p>
//                 <span className="text-blue-600">Click to upload</span> or drag
//                 and drop
//               </p>
//               <p className="my-2">SVG, PNG, JPG or GIF (max. 800 × 400px)</p>
//             </div>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={handleFileChange}
//             />
//           </div>
//         </div>

//         <button
//           type="submit"
//           className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-md text-white font-semibold"
//         >
//           Submit
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState, useRef } from "react";
import { FiUser, FiMail, FiTrash2, FiLock } from "react-icons/fi";

import profileImg from "../../assets/adminImages/myprofile/Ellipse.png";
import bgImage from "../../assets/adminImages/myprofile/image1.png";
import img from "../../assets/adminImages/myprofile/upload.png";
import ResetPasswordModal from "../../Components/AdminComponents/ResetPasswordModal";

export default function Profile() {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Carter",
    email: "example@yourmail.com",
    photo: profileImg,
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleChangePassword = () => setShowResetModal(true);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, photo: imageURL }));
    }
  };

  const handleDeletePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      "Profile Updated Successfully!\n" + JSON.stringify(formData, null, 2)
    );
  };

  return (
    <div className="bg-[#0D0F1C] min-h-screen text-white px-4 sm:px-6 md:px-10 py-6">
      {/* Header */}
      <div
        className="relative w-full h-24 sm:h-28 md:h-32 rounded-b-xl"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute bottom-[-30px] left-4 sm:left-6 flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-[#0D0F1C]">
            <img
              src={formData.photo}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold">JuliusCesar1014</h2>
        </div>
        <button
          onClick={handleChangePassword}
          className="absolute right-4 top-[90px] sm:top-[100px] bg-[#1A1D2E] border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
        >
          <FiLock /> Change Password
        </button>
      </div>

      {showResetModal && (
        <ResetPasswordModal onClose={() => setShowResetModal(false)} />
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#101223] mt-20 mx-auto rounded-xl p-4 sm:p-6 md:p-8 max-w-4xl"
      >
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <FiUser /> Account
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Lorem ipsum dolor sit amet consectetur sit mauris nec morbi nisi.
        </p>

        <p className="text-sm text-gray-400 mb-4">
          Lorem ipsum dolor sit amet consectetur quisque nisi eget mi libero leo
          vel claim in.
        </p>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm mb-1" htmlFor="firstName">
              First name
            </label>
            <FiUser className="absolute top-10 left-3 text-gray-400" />
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full bg-[#1A1D2E] border-none rounded-md pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="relative">
            <label className="block text-sm mb-1" htmlFor="lastName">
              Last name
            </label>
            <FiUser className="absolute top-10 left-3 text-gray-400" />
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full bg-[#1A1D2E] border-none rounded-md pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="mb-6 relative">
          <label className="block text-sm mb-1" htmlFor="email">
            Email address
          </label>
          <FiMail className="absolute top-10 left-3 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-[#1A1D2E] border-none rounded-md pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Upload Section */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:gap-10 gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Img
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleDeletePhoto}
              className="text-blue-600 text-sm hover:text-red-500 flex items-center gap-1"
            >
              <FiTrash2 /> Delete
            </button>
          </div>

          <div className="w-full">
            <div
              className="border border-dashed border-gray-600 rounded-lg p-5 text-center text-sm text-gray-400 cursor-pointer flex flex-col items-center gap-2 bg-[#151B2D]"
              onClick={handleUploadClick}
            >
              <img src={img} alt="upload" className="w-12 h-12" />
              <p>
                <span className="text-blue-600">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">
                SVG, PNG, JPG or GIF (max. 800×400px)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-md text-white font-semibold"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
