import React from "react";

const DisclosuresPage = () => {
  return (
    <>
     <div className="bg-[url(./assets/Images/heroImg.png)]  rounded-3xl md:w-[90%] w-full md:h-[360px] h-[200px] mx-auto object-center bg-no-repeat md:my-35 mt-30 mb-20  flex items-center justify-center font-abcRepro ">
        <div className="blue-blur-circle"></div>

        <h1 className="md:text-6xl text-4xl font-abcRepro font-bold">Refund Policy</h1>
      </div>
      <h1 className="md:text-2xl sm:text-xl text-lg sm:font-bold font-semibold font-abcRepro text-wrap md:w-[90%] w-full text-center md:leading-10 mx-auto ">
        Welcome to <span className="text-primary"> TradingTantra.in. </span>Your
        privacy is important to us, and we are committed to protecting your
        personal information. This Privacy Policy explains how we collect, use,
        share, and safeguard your data when you use our stock market screener
        website.
      </h1>
      <section className="font-abcRepro space-y-10 mt-40">
        {/* point 1 */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">1. Information We Collect</h2>
          <p className="font-light text-xl">
            When you use TradingTantra.in, we may collect the following types of
            information:
          </p>
          <div className="space-y-4">
            <p className="font-normal text-2xl">1.1 Personal Information</p>
            <ul className="list-disc pl-10">
              <li className="text-[#C6C6C6] text-base">
                {" "}
                Name, email address, and contact details (if you register an account or subscribe to our services).
              </li>
              <li className="text-[#C6C6C6] text-base">
                {" "}
                Payment details (processed securely through third-party payment gateways; we do not store your payment information).
              </li>
            </ul>
          </div>
          <div className="space-y-5">
            <p className="font-normal text-2xl">1.2 Non-Personal Information</p>
            <ul className="list-disc pl-10">
              <li className="text-[#C6C6C6] text-base ">
                {" "}
                IP address, browser type, and device information.
              </li>
              <li className="text-[#C6C6C6] text-base">
                Website usage data, including pages visited and time spent on
                our platform.
              </li>
              <li className="text-[#C6C6C6] text-base">
                Cookies and tracking technologies (see Section 5).
              </li>
            </ul>
          </div>
        </div>
        {/* point 2  */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">2. How We Use Your Information</h2>
          <p className="font-light text-xl">
            We use your data for the following purposes:
          </p>
          <div className="space-y-4">
            <ul className="list-disc pl-10">
              <li className="text-[#C6C6C6] text-base">
                To provide and improve our stock screener services.
              </li>
              <li className="text-[#C6C6C6] text-base">
                To personalize your experience and recommend relevant stocks.
              </li>
              <li className="text-[#C6C6C6] text-base">
                To process payments and manage subscriptions.
              </li>
              <li className="text-[#C6C6C6] text-base">
                To send updates, newsletters, and promotional content (only if
                you opt-in).
              </li>
              <li className="text-[#C6C6C6] text-base">
                To enhance website security and prevent fraudulent activities.
              </li>
            </ul>
          </div>
        </div>
        {/* point 3 */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">
            3. How We Share Your Information
          </h2>
          <p className="font-light text-xl">
            We do not sell, trade, or rent your personal information. However,
            we may share your data with:
          </p>
          <div className="space-y-4">
            <ul className="list-disc pl-10">
              <li className="text-[#C6C6C6] text-base">
                Service Providers: Third-party vendors for hosting, payment
                processing, analytics, and customer support.
              </li>
              <li className="text-[#C6C6C6] text-base">
                Legal & Compliance: If required by law, regulation, or legal
                processes.
              </li>
              <li className="text-[#C6C6C6] text-base">
                Business Transfers: In case of a merger, acquisition, or sale of
                assets, your information may be transferred.
              </li>
            </ul>
          </div>
        </div>
        {/* point 4 */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">4. Data Security</h2>
          <p className="font-light text-xl">
            We implement strict security measures to protect your information
            from unauthorized access, alteration, or loss. However, no method of
            data transmission over the internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </div>
        {/* point 5 */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">
            5. Cookies & Tracking Technologies
          </h2>
          <p className="font-light text-xl">
            We use cookies and similar tracking technologies to enhance your
            browsing experience. You can manage or disable cookies in your
            browser settings, but this may impact website functionality.
          </p>
        </div>
        {/* point 6  */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">6. Your Rights & Choices</h2>
          <div className="space-y-4">
            <ul className="list-disc pl-10">
              <li className="text-[#C6C6C6] text-base">
                Access & Correction: You can request access to or correction of
                your personal information.
              </li>
              <li className="text-[#C6C6C6] text-base">
                Opt-Out: You can unsubscribe from marketing emails anytime by
                clicking the "unsubscribe" link.
              </li>
              <li className="text-[#C6C6C6] text-base">
                Data Deletion: You may request the deletion of your account and
                data, subject to legal and operational requirements.
              </li>
            </ul>
          </div>
        </div>
        {/* point 7 */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">7. Third-Party Links</h2>
          <p className="font-light text-xl">
            TradingTantra.in may contain links to third-party websites. We are
            not responsible for their privacy practices and encourage you to
            review their policies.
          </p>
        </div>
        {/* point 8 */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">8. Changes to This Policy</h2>
          <p className="font-light text-xl">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page, and continued use of our services
            implies acceptance of the updated policy.
          </p>
        </div>
        {/* point 9 */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">9. PAYMENT & FEES</h2>
          <p className="font-light text-xl">
            Should You register for any of the paid Services on this website or
            purchase any product or service on this website, You agree to pay Us
            the specific monetary amounts required for that product or those
            Services. These monetary amounts ("Fees") will be described to You
            during Your account registration and/or confirmation process. The
            final amount required for payment will be shown to You immediately
            prior to purchase. Payment for any ongoing Services is billed
            automatically until You notify Us that You would like to terminate
            Your access to the Services.
          </p>
          <p className="font-light text-xl">
            We reserve the right to refuse service or refuse to sell the
            products on the Website at our sole discretion to anyone for any
            reason at any time.
          </p>
        </div>

        {/* point 10  */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">10. ACCEPTABLE USE</h2>
          <p className="font-light text-xl">
            You agree not to use the Website or Services for any unlawful
            purpose or any purpose prohibited under this clause. You agree not
            to use the Website or Services in any way that could damage the
            Website, Services or general business of the Owner.
          </p>
          <div className="space-y-4">
            <p className="font-normal text-2xl">
              You further agree not to use the Website or Services:
            </p>
            <ul className="list-disc pl-10">
              <li className="text-[#C6C6C6] text-base">
                To harass, abuse, or threaten others or otherwise violate any
                person's legal rights;
              </li>
              <li className="text-[#C6C6C6] text-base">
                To violate any intellectual property rights of the Owner or any
                third party;
              </li>
              <li className="text-[#C6C6C6] text-base">
                To upload or otherwise disseminate any computer viruses or other
                software that may damage the property of another;
              </li>
              <li className="text-[#C6C6C6] text-base">
                To perpetrate any fraud;
              </li>
              <li className="text-[#C6C6C6] text-base">
                To engage in or create any unlawful gambling, sweepstakes, or
                pyramid scheme;
              </li>
              <li className="text-[#C6C6C6] text-base">
                To publish or distribute any obscene or defamatory material;
              </li>
              <li className="text-[#C6C6C6] text-base">
                To publish or distribute any material that incites violence,
                hate or discrimination towards any group;
              </li>
              <li className="text-[#C6C6C6] text-base">
                To unlawfully gather information about others.
              </li>
            </ul>
           
          </div>
          <div className="space-y-5">
            <p className="font-normal text-2xl">
              You are prohibited from using the site or its content:
            </p>
            <ul className="list-disc pl-10">
              <li className="text-[#C6C6C6] text-base">
                for any unlawful purpose;
              </li>
              <li className="text-[#C6C6C6] text-base">
                to solicit others to perform or participate in any unlawful
                acts;
              </li>
              <li className="text-[#C6C6C6] text-base">
                to infringe on any third party's intellectual property or
                proprietary rights, or rights of publicity or privacy, whether
                knowingly or unknowingly;
              </li>
              <li className="text-[#C6C6C6] text-base">
                to violate any local, federal or international law, statute,
                ordinance or regulation;
              </li>
              <li className="text-[#C6C6C6] text-base">
                to harass, abuse, insult, harm, defame, slander, disparage,
                intimidate, or discriminate based on gender, sexual orientation,
                religion, ethnicity, race, age, national origin, or disability;
              </li>
              <li className="text-[#C6C6C6] text-base">
                to submit false or misleading information or any content which
                is defamatory, libelous, threatening, unlawful, harassing,
                indecent, abusive, obscene, or lewd and lascivious or
                pornographic, or exploits minors in any way or assists in human
                trafficking or content that would violate rights of publicity
                and/or privacy or that would violate any law;
              </li>
              <li className="text-[#C6C6C6] text-base">
                to upload or transmit viruses or any other type of malicious
                code that will or may be used in any way that will affect the
                functionality or operation of the Service or of any related
                website, other websites, or the Internet;
              </li>
              <li className="text-[#C6C6C6] text-base">
                to collect or track the personal information of others;
              </li>
              <li className="text-[#C6C6C6] text-base">
                to damage, disable, overburden, or impair the Website or any
                other party's use of the Website; (j) to spam, phish, pharm,
                pretext, spider, crawl, or scrape;
              </li>
              <li className="text-[#C6C6C6] text-base">
                for any obscene or immoral purpose; or
              </li>
              <li className="text-[#C6C6C6] text-base">
                to interfere with or circumvent the security features of the
                Service or any related website, other websites, or the Internet;
              </li>
              <li className="text-[#C6C6C6] text-base">
                to personally threaten or has the effect of personally
                threatening other Users. We reserve the right to terminate your
                use of the Service or any related website for violating any of
                the prohibited uses. We reserve the full authority to review all
                content posted by Users on the Website. You acknowledge that the
                Website is not responsible or liable and does not control the
                content of any information that may be posted to the Website by
                You or other User of the Website and you are solely responsible
                for the same. You agree that You shall not upload, post, or
                transmit any content that you do not have a right to make
                available (such as, the intellectual property of another party).
              </li>
            </ul>
            <p className="text-[#C6C6C6] text-base">
            You agree to comply with all applicable laws, statutes, and regulations concerning your use of the Website and further agree that you will not transmit any information, data, text, files, links, software, chats, communication or other materials that are abusive, invasive of another's privacy, harassing, defamatory, vulgar, obscene, unlawful, false, misleading, harmful, threatening, hateful or racially or otherwise objectionable, including without limitation material of any kind or nature that encourages conduct that could constitute a criminal offence, give rise to civil liability or otherwise violate any applicable local, state, provincial, national, or international law or regulation, or encourage the use of controlled substances.
              </p>
          </div>
        </div>

        {/* point 11 */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">11. AFFILIATE MARKETING & ADVERTISING</h2>
          <p className="font-light text-xl">
          The Owner, through the Website and Services, may engage in affiliate marketing whereby the Owner receives a commission on or percentage of the sale of goods or services on or through the Website. The Owner may also accept advertising and sponsorships from commercial businesses or receive other forms of advertising compensation.
          </p>
          
        </div>
        {/* point 12 */}
        <div className="space-y-5">
          <h2 className="font-bold text-3xl">12. DATA LOSS</h2>
          <p className="font-light text-xl">
          The Owner does not accept responsibility for the security of Your account or content. You agree that Your use of the Website or Services is at Your own risk.
          </p>
          
        </div>
      </section>
    </>
  );
};

export default DisclosuresPage;
