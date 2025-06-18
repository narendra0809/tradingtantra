import profileBgCover from "../../assets/Images/Dashboard/homepage/profileBgCover.png";
import userImg from "../../assets/Images/Dashboard/HeaderImg/user.png";
import { useAuth } from "../../contexts/AuthContext";

const ProfileHeader = () => {
  const { user } = useAuth();
  return (
    <div className="w-full h-[200px] relative  dark:bg-db-primary bg-db-primary rounded-lg overflow-hidden mb-6">
      {/* Background Section */}
      <div className="relative h-[60%] w-full">
        <img
          src={profileBgCover}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Content */}
      <div className="dark:bg-db-secondary bg-db-primary p-4 flex items-center justify-end h-[40%]">
        <div className="flex items-center gap-4 absolute left-5 top-[45%]">
          {/* Profile Picture */}
          <img
            src={userImg}
            alt="Profile"
            className="w-16 h-16 rounded-full border-4 border-[#0A0F2C] "
          />

          {/* User Info */}
          <div>
            <h2 className="text-white text-lg font-semibold mb-2">
              {user.displayName}
            </h2>
            <p className="text-gray-400 font-medium text-sm flex items-center mt-2">
              Active now
              <span className="ml-2 text-[10px] text-white bg-primary  px-2  rounded-full">
                Pro
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
