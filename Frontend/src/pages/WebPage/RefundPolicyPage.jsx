import React from "react";
import image1 from "../../assets/Images/RefundPolicyImg1.png";
import image2 from "../../assets/Images/RefundPolicyImg2.png";
import image3 from "../../assets/Images/RefundPolicyImg3.png";
const RefundPolicyPage = () => {
  return (
    <>
     <div className="bg-[url(./assets/Images/heroImg.png)]  rounded-3xl md:w-[90%] w-full md:h-[360px] h-[200px] mx-auto object-center bg-no-repeat md:my-35 mt-30 mb-20  flex items-center justify-center font-abcRepro ">
        <div className="blue-blur-circle"></div>

        <h1 className="md:text-6xl text-4xl font-abcRepro font-bold">Refund Policy</h1>
      </div>
      <h1 className="md:text-2xl text-xl font-bold font-abcRepro text-wrap lg:w-[60%] md:w-[90%] w-full text-center lg:leading-10 mx-auto ">
        Thank you for choosing{" "}
        <span className="text-primary"> TradingTantra.in. </span> an AI-powered
        stock market screener. Please read our refund policy carefully before
        making any purchases.
      </h1>

      <div className="flex  items-center justify-between w-full mt-20">
        <div className="font-abcRepro lg:w-1/2 w-full space-y-5">
          <h4 className="text-3xl font-bold ">No Refund Policy</h4>
          <p className="text-base font-thin text-wrap ">
            All purchases made on TradingTantra.in are final and non-refundable.
            We do not offer refunds, exchanges, or cancellations for any
            subscription plans, one-time purchases, or digital products.
          </p>
          <p className="text-base font-thin text-wrap ">
            Once a Service is subscribed and paid for, it cannot be canceled or
            refunded under any circumstances. Though, We will always do our best
            to increase the level of satisfaction by constantly upgrading our
            services. However, any request by the Customer to cancel any service
            or get a refund will not be entertained in any case. We strongly
            recommend that our visitors and potential customers, before making a
            payment, please read all information regarding our services and the
            support provided to our customers.
          </p>
          <p className="text-base font-thin text-wrap ">
            Read our Terms and Conditions. Read our refund policy. Refund is not
            possible in any case. Please make payment after reading all terms
            and conditions, disclaimers, disclosures and refund policy.
          </p>
        </div>
        <div>
          <img src={image1} className="lg:block hidden" />
        </div>
      </div>

      <div className="w-full flex  md:flex-row flex-col items-center justify-between mt-20 space-y-10">
        <div className="flex flex-col items-center lg:w-[40%] md:w-1/2  w-full">
          <img src={image2} className="sm:w-60 sm:h-60 w-auto h-auto" />
          <div className="text-center sm:space-y-2 mt-10">
            <h4 className="font-bold text-3xl">Exceptional Cases</h4>
            <p className="text-base font-light mt-4">
              Refunds will only be considered in the following circumstances:
            </p>
            <p className="text-base font-light">If you were charged incorrectly due to a system error.</p>
          </div>
        </div>
        <div className="flex flex-col items-center lg:w-[40%] md:w-1/2 w-full">
          <img src={image3} className="sm:w-60 sm:h-60 w-auto h-auto" />
          <div className="text-center space-y-3 mt-10">
            <h4 className="font-bold text-3xl">Changes to This Policy</h4>
            <p className="text-base font-light lg:leading-8">
              We reserve the right to update or modify this refund policy at any
              time. Any changes will be posted on this page, and continued use
              of our services implies acceptance of the updated policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicyPage;
