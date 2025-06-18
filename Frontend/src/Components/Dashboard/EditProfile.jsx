import { FiMail, FiUser } from "react-icons/fi";

const EditProfile = () => {
  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 dark:bg-db-primary bg-db-primary rounded-xl mt-8 sm:mt-16 shadow-sm dark:shadow-gray-800/50">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
          <FiUser className="text-[#4F46E5]" /> Account Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update your personal information
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4 sm:space-y-6">
        {/* Name Fields - Responsive Row */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
              First Name
            </label>
            <div className="flex items-center dark:bg-[#151B2D] bg-white dark:bg-opacity-50 border border-gray-300 dark:border-gray-700 p-2 rounded-md focus-within:ring-1 focus-within:ring-primary">
              <FiUser className="text-gray-500 ml-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="John"
                className="bg-transparent outline-none px-3 py-1 w-full text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
              Last Name
            </label>
            <div className="flex items-center dark:bg-[#151B2D] bg-white dark:bg-opacity-50 border border-gray-300 dark:border-gray-700 p-2 rounded-md focus-within:ring-1 focus-within:ring-primary">
              <FiUser className="text-gray-500 ml-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Carter"
                className="bg-transparent outline-none px-3 py-1 w-full text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
            Email Address
          </label>
          <div className="flex items-center dark:bg-[#151B2D] bg-white dark:bg-opacity-50 border border-gray-300 dark:border-gray-700 p-2 rounded-md focus-within:ring-1 focus-within:ring-primary">
            <FiMail className="text-gray-500 ml-2 flex-shrink-0" />
            <input
              type="email"
              placeholder="example@youremail.com"
              className="bg-transparent outline-none px-3 py-1 w-full text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
