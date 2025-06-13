import EditProfile from "../../Components/Dashboard/EditProfile";
import ProfileHeader from "../../Components/Dashboard/ProfileHeader";

const MyProfilePage = () => {
  // const handleImageUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setImage(URL.createObjectURL(file));
  //   }
  // };
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
