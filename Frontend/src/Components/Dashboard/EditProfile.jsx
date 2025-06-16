import { FiMail, FiUser } from "react-icons/fi";

const EditProfile = () => {
  return (
    <div className="max-w-xl mx-auto p-6 dark:bg-db-primary bg-db-primary rounded-xl mt-16 ">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FiUser className="text-[#4F46E5]" /> Account
        </h2>
        <p className="dark:text-gray-400 text-gray-700  text-sm mt-1">
          Lorem ipsum dolor sit amet consectetur sit mauris nec morbi nisi.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-base font-medium">Personal Information</h3>
        <p className="dark:text-gray-400 text-gray-600  text-sm">
          Lorem ipsum dolor sit amet consectetur quisque nisi eget mi libero leo
          vel.
        </p>
      </div>

      <div className="space-y-4">
        <form>
          <div className="md:flex justify-between block">
            <div className="mb-1">
              <label className="text-sm dark:text-gray-400 text-gray-700 ">
                First Name
              </label>
              <div className="flex items-center dark:bg-[#151B2D]  border   bg-transparent  dark:border-transparent  p-2 rounded-md mt-1">
                <FiUser className="text-gray-500 ml-2" />
                <input
                  type="text"
                  placeholder="John"
                  className="bg-transparent outline-none  px-2 w-full"
                />
              </div>
            </div>

            <div className="mb-1">
              <label className="text-sm dark:text-gray-400 text-gray-700 ">
                Last Name
              </label>
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

          <div>
            <label className="text-sm dark:text-gray-400 text-gray-700 ">
              Email Address
            </label>
            <div className="flex items-center dark:bg-[#151B2D] bg-transparent border dark:border-transparent  p-2 rounded-md mt-1">
              <FiMail className="text-gray-500 ml-2" />
              <input
                type="email"
                placeholder="example@youremail.com"
                className="bg-transparent outline-none  px-2 w-full"
              />
            </div>
          </div>
          <div className="w-full text-center mt-5">
            <button className="bg-primary w-full rounded-lg p-2">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
