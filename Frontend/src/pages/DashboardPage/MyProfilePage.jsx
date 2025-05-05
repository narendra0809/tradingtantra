import React from "react";
import { FiUser, FiMail, FiCamera } from "react-icons/fi";
import user from "../../assets/Images/Dashboard/HeaderImg/user.png";
import { PowerOffIcon } from "lucide-react";
import ProfileHeader from "../../Components/Dashboard/ProfileHeader";

const MyProfilePage = () => {
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };
  return (
    <>
    <div className="mt-10">
        <ProfileHeader/>
    </div>
      <div className="max-w-xl mx-auto p-6 dark:bg-db-primary bg-db-primary-light   rounded-xl mt-16 ">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FiUser className="text-[#4F46E5]" /> Account
          </h2>
          <p className="dark:text-gray-400 text-gray-700  text-sm mt-1">
            Lorem ipsum dolor sit amet consectetur sit mauris nec morbi nisi.
          </p>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <h3 className="text-base font-medium">Personal Information</h3>
          <p className="dark:text-gray-400 text-gray-600  text-sm">
            Lorem ipsum dolor sit amet consectetur quisque nisi eget mi libero
            leo vel.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* First Name */}
          <div className="md:flex justify-between block">
            <div>
              <label className="text-sm dark:text-gray-400 text-gray-700 ">First Name</label>
              <div className="flex items-center dark:bg-[#151B2D]  border   bg-transparent  dark:border-transparent  p-2 rounded-md mt-1">
                <FiUser className="text-gray-500 ml-2" />
                <input
                  type="text"
                  placeholder="John"
                  className="bg-transparent outline-none  px-2 w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm dark:text-gray-400 text-gray-700 ">Last Name</label>
              <div className="flex items-center dark:bg-[#151B2D] bg-transparent border dark:border-transparent  p-2 rounded-md mt-1">
                <FiUser className="text-gray-500 ml-2" />
                <input
                  type="text"
                  placeholder="Carter"
                  className="bg-transparent outline-none  px-2 w-full"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm dark:text-gray-400 text-gray-700 ">Email Address</label>
            <div className="flex items-center dark:bg-[#151B2D] bg-transparent border dark:border-transparent  p-2 rounded-md mt-1">
              <FiMail className="text-gray-500 ml-2" />
              <input
                type="email"
                placeholder="example@youremail.com"
                className="bg-transparent outline-none  px-2 w-full"
              />
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div className="flex gap-6">
            <div>
              <label className="text-sm dark:text-gray-400 text-gray-700 ">Photo</label>
              <div>
                <img
                  src={user}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              </div>

              <button className="bg-transparent text-[#1A68FF] text-[12px] cursor-pointer">
                Delete
              </button>
            </div>
            <div className="mt-2 flex flex-col w-full items-center border border-dashed dark:border-gray-500 p-6 rounded-md dark:bg-[#151B2D] bg-transparent  ">
              <div className="text-center">
                <FiCamera className="text-gray-500 text-3xl mx-auto" />
                <p className="text-sm mt-2 dark:text-gray-400 text-gray-600 ">
                  <label className="text-blue-400 cursor-pointer">
                    Click to upload
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>{" "}
                  or drag and drop
                </p>
                <p className="text-xs dark:text-gray-500 text-gray-700">
                  SVG, PNG, JPG or GIF (max. 800 × 400px)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfilePage;
