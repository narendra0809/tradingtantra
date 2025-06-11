import { useState } from "react";
import EditProfile from "../../Components/Dashboard/EditProfile";
import ProfileHeader from "../../Components/Dashboard/ProfileHeader";
import BuyPlanPage from "../WebPage/BuyPlanPage";

const MyProfilePage = () => {
  const [buyShow, setBuyShow] = useState(false);

  const handleBuyShow = () => {
    setBuyShow(true);
  };
  const handleProfileShow = () => {
    setBuyShow(false);
  };
  // const handleImageUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setImage(URL.createObjectURL(file));
  //   }
  // };
  return (
    <>
      <div className="mt-10">
        <ProfileHeader
          buyShow={buyShow}
          handleProfileShow={handleProfileShow}
          handleBuyShow={handleBuyShow}
        />
      </div>
      <div>{buyShow ? <BuyPlanPage /> : <EditProfile />}</div>
    </>
  );
};

export default MyProfilePage;
