import { FiMail, FiUser } from "react-icons/fi";

const EditProfile = () => {
  return (
    <div className="max-w-xl mx-auto p-6 bg-db-primary not-dark:bg-primary-light rounded-xl mt-16 shadow-lg shadow-gray-800/20">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
          <FiUser className="text-[#4F46E5]" /> Account Settings
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Update your personal information
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        {/* Name Fields - Responsive Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 not-dark:text-white">
              First Name
            </label>
            <div className="flex items-center bg-[#151B2D] not-dark:bg-[#738ce7] border border-gray-700 rounded-lg px-4 py-3 focus-within:ring-1 focus-within:ring-primary">
              <FiUser className="text-gray-400 mr-3 not-dark:text-white" />
              <input
                type="text"
                placeholder="John"
                className="bg-transparent  outline-none w-full text-white placeholder-gray-500 not-dark:placeholder-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 not-dark:text-white">
              Last Name
            </label>
            <div className="flex items-center bg-[#151B2D] not-dark:bg-[#738ce7] border border-gray-700 rounded-lg px-4 py-3 focus-within:ring-1 focus-within:ring-primary">
              <FiUser className="text-gray-400 mr-3 not-dark:text-white" />
              <input
                type="text"
                placeholder="Carter"
                className="bg-transparent outline-none w-full text-white placeholder-gray-500 not-dark:placeholder-white"
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 not-dark:text-white">
            Email Address
          </label>
          <div className="flex items-center bg-[#151B2D] not-dark:bg-[#738ce7] border border-gray-700 rounded-lg px-4 py-3 focus-within:ring-1 focus-within:ring-primary">
            <FiMail className="text-gray-400 mr-3 not-dark:text-white" />
            <input
              type="email"
              placeholder="example@youremail.com"
              className="bg-transparent outline-none w-full text-white placeholder-gray-500 not-dark:placeholder-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#151B2D]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
