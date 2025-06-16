import EditProfile from "../../Components/Dashboard/EditProfile";
import ProfileHeader from "../../Components/Dashboard/ProfileHeader";

const MyProfilePage = () => {
  return (
    <>
      <div className="mt-10">
        <ProfileHeader />
      </div>
      <EditProfile />
    </>
  );
};

export default MyProfilePage;
