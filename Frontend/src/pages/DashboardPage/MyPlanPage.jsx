/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import ProfileHeader from "../../Components/Dashboard/ProfileHeader";
import { useAuth } from "../../contexts/AuthContext";
import useFetchData from "../../utils/useFetchData";
import BuyPlanPage from "../WebPage/BuyPlanPage";
import Cookies from "js-cookie";
import { ArrowBigLeft } from "lucide-react";
import RenewPlanPage from "../WebPage/RenewPlanPage";

const MyPlanPage = () => {
  const { fetchData } = useFetchData();
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userSub, setUserSub] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });
  const [showRenewModal, setShowRenewModal] = useState(false);

  const fetchUserSubDetails = async () => {
    try {
      const res = await fetchData(
        `subcription-end-date?userId=${user.userId}`,
        "GET"
      );
      if (res.status !== 200) {
        throw new Error("Failed to fetch sub details!");
      }
      const userSubData = {
        startDate: new Date(res.data.startDate).toLocaleString(),
        endDate: new Date(res.data.endDate).toDateString(),
        status: res.data.status,
      };
      setUserSub(userSubData);
      setIsSubscribed(true);
    } catch (error) {
      console.log(error);
      setIsSubscribed(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      const cookieSubscribed = Boolean(Cookies.get("isSubscribed"));
      setIsSubscribed(cookieSubscribed);
      fetchUserSubDetails();
    } else {
      setIsSubscribed(false);
    }
  }, []);

  return (
    <>
      <div className="mt-10">
        <ProfileHeader />
      </div>

      <h3 className="text-xl text-blue-400 text-center font-semibold px-6 py-2">
        {!showRenewModal && isSubscribed
          ? "My Plan"
          : !showRenewModal && "Not Subscribed Yet? Buy Subscription Now"}
      </h3>
      <div className="dark:bg-db-primary bg-primary-light rounded-[20px] mx-auto py-6">
        {showRenewModal && (
          <button
            onClick={() => setShowRenewModal(false)}
            className="flex items-center gap-1 text-lg ml-5 hover:font-bold not-dark:text-white"
          >
            <ArrowBigLeft />
            <span>Back</span>
          </button>
        )}
        {showRenewModal && (
          <RenewPlanPage setShowRenewModal={setShowRenewModal} />
        )}
        {!showRenewModal && isSubscribed ? (
          <div className="px-6 py-2 flex justify-between items-center border-b border-[#26304A] not-dark:text-white">
            <div>
              <h4 className="text-xl font-semibold">Diamonds</h4>
              <p className="font-light">Valid till: {userSub.endDate}</p>
              <p className="font-light dark:text-[#0155F3] text-primary">
                View Transaction Details
              </p>
            </div>
            <button
              onClick={() => setShowRenewModal(true)}
              className="bg-[#0155F3] text-white font-light py-2 px-2.5 h-fit rounded"
            >
              Renew
            </button>
          </div>
        ) : (
          !showRenewModal && <BuyPlanPage />
        )}
      </div>
    </>
  );
};

export default MyPlanPage;
