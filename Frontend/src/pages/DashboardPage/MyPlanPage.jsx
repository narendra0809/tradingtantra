/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import ProfileHeader from "../../Components/Dashboard/ProfileHeader";
import { useAuth } from "../../contexts/AuthContext";
import useFetchData from "../../utils/useFetchData";
import BuyPlanPage from "../WebPage/BuyPlanPage";
import Cookies from "js-cookie";

const MyPlanPage = () => {
  // const isSubscribed = Cookies.get("isSubscribed");
  const isSubscribed = true;
  const { fetchData } = useFetchData();
  const { user } = useAuth();
  const [userSub, setUserSub] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });
  const fetchUserSubDetails = async () => {
    try {
      const res = await fetchData(
        `subcription-end-date?userId=${user.userId}`,
        "GET"
      );
      if (res.status !== 200) {
        throw new Error("Failed to fetch sub detials !");
      }
      const userSubData = {
        startDate: new Date(res.data.startDate).toLocaleString(),
        endDate: new Date(res.data.endDate).toDateString(),
        status: res.data.status,
      };
      setUserSub(userSubData);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUserSubDetails();
  }, []);
  return (
    <>
      <div className="mt-10">
        <ProfileHeader />
      </div>

      <h3 className="text-xl text-blue-400 text-center font-semibold px-6 py-2 ">
        {isSubscribed ? "My Plan" : "Not Subscribed Yet ? Buy Subscription Now"}
      </h3>
      <div className="dark:bg-db-primary bg-db-primary rounded-[20px] mx-auto  py-6">
        {isSubscribed ? (
          <div className="px-6 py-2 flex justify-between items-center border-b border-[#26304A]">
            <div>
              <h4 className="text-xl font-semibold">Diamonds</h4>
              <p className="font-light">Valid till: {userSub.endDate}</p>
              <p className="font-light dark:text-[#0155F3]   text-primary">
                View Transaction Details
              </p>
            </div>

            <button className="bg-[#0155F3] text-white  font-light py-2 px-2.5 h-fit rounded">
              Renew
            </button>
          </div>
        ) : (
          <BuyPlanPage />
        )}
      </div>
    </>
  );
};

export default MyPlanPage;
