import { FiEdit, FiCalendar } from "react-icons/fi";
import profileBgCover from "../../assets/Images/Dashboard/homepage/profileBgCover.png";
import user from "../../assets/Images/Dashboard/HeaderImg/user.png";
import { useLocation } from "react-router-dom";
const ProfileHeader = () => {

    const location = useLocation();

     

  return (
    <div className="w-full h-[200px] relative  dark:bg-db-primary bg-db-secondary-light rounded-lg overflow-hidden mb-6">
      {/* Background Section */}
      <div className="relative h-[60%] w-full">
        <img
          src={profileBgCover}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Content */}
      <div className="dark:bg-db-secondary bg-db-secondary-light p-4 flex items-center justify-end h-[40%]">
        <div className="flex items-center gap-4 absolute left-5 top-[45%]">
          {/* Profile Picture */}
          <img
            src={user}
            alt="Profile"
            className="w-16 h-16 rounded-full border-4 border-[#0A0F2C] "
          />

          {/* User Info */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-2">
              JuliusCesar1014
            </h2>
            <p className="text-gray-400 font-medium text-sm flex items-center mt-2">
              Active now
              <span className="ml-2 text-[10px] text-white bg-primary  px-2  rounded-full">
                Pro
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
            {
                location.pathname === '/dashboard/profile' && (
                    <div className="flex gap-2">
                    <button className="flex items-center gap-1 bg-[#0256F5] text-white px-4 py-2 rounded-md text-sm  transition">
                      Edit Profile
                      <FiEdit />
                    </button>
           
                    <button className="flex items-center gap-1 bg-transparent border border-[#0256F5]  text-white px-4 py-2 rounded-md text-sm  transition">
                      Subscribe Plan
                      <FiCalendar />
                    </button>
                  </div>
                )
            }
      </div>
    </div>
  );
};

export default ProfileHeader;
