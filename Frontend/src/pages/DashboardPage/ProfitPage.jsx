import React from "react";

const ProfitPage = () => {
  return (
    <div className="mt-10 space-y-10">
      <h4 className="font-Inter text-3xl font-medium ">Profit</h4>
      <div className="dark:bg-db-primary bg-db-primary-light  border border-[#0009B250] p-5 rounded-[5px] space-y-10">
        <div className="space-y-5 text-base font-normal font-abcRepro ">
        <p>Hello folks,</p>
        <p>We regularly post Trading outcome of traders on our social media.</p>
        <p>You can share your trades on our Telegram ID @tradefinder_share</p>
        </div>
        <div className=" text-base font-abcRepro space-y-4">
          <h5 className="font-bold  ">Note:</h5>
          <p className="font-normal ">This telegram Id is created so that you can share your trades with us. We don't use for active conversation. If you want to give any feedback to us, then kindly use feedback tab in the TradeFinder Menu.</p>
        </div>


      </div>
    </div>
  );
};

export default ProfitPage;
