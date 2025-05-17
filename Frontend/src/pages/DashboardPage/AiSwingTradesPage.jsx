import React, { useEffect, useState, Suspense } from "react";
import Cookies from "js-cookie";
import {
  usefetchAiCandleBreakers,
  usefetchAiCandleReversal,
  usefetchAiContraction,
  usefetchFiveDayBreakOut,
  usefetchTenDayBreakOut,
} from "../../hooks/fetchStocksData";

// Lazy load components
const FiveDayBO = React.lazy(() => import("../../Components/Dashboard/Cards/SwingTrad/fiveDayBO"));
const TenDayBO = React.lazy(() => import("../../Components/Dashboard/Cards/SwingTrad/tenDayBO"));
const AICandleReversal = React.lazy(() => import("../../Components/Dashboard/Cards/SwingTrad/AICandleReversal"));
const AIChannelBreakers = React.lazy(() => import("../../Components/Dashboard/Cards/SwingTrad/AIChannelBreakers"));
const AIContractions = React.lazy(() => import("../../Components/Dashboard/Cards/SwingTrad/AIContraction"));

const AiSwingTradesPage = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  // check subscription cookie
  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  // hooks for data fetching
  const {
    fiveDayBOData,
    fiveDayBOLoading,
    fiveDayBOError,
    fetchFiveDayBOData,
  } = usefetchFiveDayBreakOut();

  const { tenDayBOData, tenDayBOLoading, tenDayBOError, fetchTenDayBOData } =
    usefetchTenDayBreakOut();

  const {
    AICandelBreakData,
    AICandelBreakDataLoading,
    AICandelBreakDataError,
    fetchAICandelBreakData,
  } = usefetchAiCandleBreakers();

  const {
    AICandelReversalData,
    AICandelReversalLoading,
    AICandelReversalError,
    fetchAICandelReversalData,
  } = usefetchAiCandleReversal();

  const {
    AiContractionData,
    AiContractionLoading,
    AiContractionError,
    fetchAiContractionData,
  } = usefetchAiContraction();

  // fetch all data only if subscribed
  useEffect(() => {
    if (isSubscribed) {
      fetchFiveDayBOData();
      fetchTenDayBOData();
      fetchAICandelBreakData();
      fetchAICandelReversalData();
      fetchAiContractionData();
    }
  }, [isSubscribed]);

  // console log all fetched data
  useEffect(() => {
    if (isSubscribed) {
      console.log("5 Day Breakout:", fiveDayBOData);
      console.log("10 Day Breakout:", tenDayBOData);
      console.log("AI Candle Break:", AICandelBreakData);
      console.log("AI Reversal:", AICandelReversalData);
      console.log("AI Contraction:", AiContractionData);
    }
  }, [
    fiveDayBOData,
    tenDayBOData,
    AICandelBreakData,
    AICandelReversalData,
    AiContractionData,
    isSubscribed,
  ]);

  return (
    <>
      <section className="mt-10">
        <h2 className="text-3xl font-bold ">AI Swing Trades</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <Suspense fallback={<div>Loading...</div>}>
            {/* Each component handles its own loading and error */}
            <FiveDayBO
              data={fiveDayBOData?.data?.data}
              loading={fiveDayBOLoading}
              error={fiveDayBOError}
              isSubscribed={isSubscribed}
            />
            <TenDayBO
              data={tenDayBOData?.data?.data}
              loading={tenDayBOLoading}
              error={tenDayBOError}
              isSubscribed={isSubscribed}
            />
            <AICandleReversal
              data={AICandelReversalData?.data?.data}
              loading={AICandelReversalLoading}
              error={AICandelReversalError}
              isSubscribed={isSubscribed}
            />
            <AIChannelBreakers
              data={AICandelBreakData?.data?.data}
              loading={AICandelBreakDataLoading}
              error={AICandelBreakDataError}
              isSubscribed={isSubscribed}
            />
            <AIContractions
              data={AiContractionData?.data?.data}
              loading={AiContractionLoading}
              error={AiContractionError}
              isSubscribed={isSubscribed}
            />
          </Suspense>
        </div>
      </section>

      
    </>
  );
};

export default AiSwingTradesPage;