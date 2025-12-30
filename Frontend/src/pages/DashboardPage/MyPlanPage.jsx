import { useEffect, useState } from "react";
import ProfileHeader from "../../Components/Dashboard/ProfileHeader";
import { useAuth } from "../../contexts/AuthContext";
import useFetchData from "../../utils/useFetchData";
import BuyPlanPage from "../WebPage/BuyPlanPage";
import RenewPlanPage from "../WebPage/RenewPlanPage";
import { ArrowBigLeft } from "lucide-react";

const MyPlanPage = () => {
  const { fetchData } = useFetchData();
  const { user } = useAuth();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userSub, setUserSub] = useState(null);
  const [showRenewModal, setShowRenewModal] = useState(false);

  const fetchUserSubDetails = async () => {
    try {
      const res = await fetchData("subcription-end-date", "GET");

      if (!res?.data?.isSubscribed) {
        setIsSubscribed(false);
        setUserSub(null);
        return;
      }

      setIsSubscribed(true);
      setUserSub({
        startDate: new Date(res.data.startDate).toLocaleString(),
        endDate: new Date(res.data.endDate).toDateString(),
        status: res.data.status,
      });
    } catch (err) {
      console.error("Subscription fetch error:", err);
      setIsSubscribed(false);
      setUserSub(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserSubDetails();
    }
  }, [user]);

  return (
    <>
      <div className="mt-10">
        <ProfileHeader />
      </div>

      <h3 className="text-2xl text-blue-400 text-center font-semibold px-6 py-2">
        {isSubscribed ? "My Plan" : "Not Subscribed Yet? Buy Subscription Now"}
      </h3>

      <div className="dark:bg-db-primary bg-primary-light rounded-[20px] mx-auto py-6">
        {showRenewModal && (
          <button
            onClick={() => setShowRenewModal(false)}
            className="flex items-center gap-1 text-lg ml-5"
          >
            <ArrowBigLeft />
            Back
          </button>
        )}

        {showRenewModal && (
          <RenewPlanPage
            setShowRenewModal={setShowRenewModal}
            onPaymentSuccess={fetchUserSubDetails}
          />
        )}

        {!showRenewModal && isSubscribed ? (
          <div className="px-6 py-2">
            <div className="flex justify-between border-b pb-5">
              <div>
                <h4 className="text-xl font-semibold">Diamond</h4>
                <p>Valid till: {userSub?.endDate}</p>
              </div>
              <button
                onClick={() => setShowRenewModal(true)}
                className="bg-[#0155F3] text-white px-4 py-2 rounded"
              >
                Renew
              </button>
            </div>
          </div>
        ) : (
          !showRenewModal && (
            <BuyPlanPage onPaymentSuccess={fetchUserSubDetails} />
          )
        )}
      </div>
    </>
  );
};

export default MyPlanPage;
