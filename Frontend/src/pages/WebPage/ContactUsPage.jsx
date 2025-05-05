import React from "react";
import contactUsBg from "../../assets/Images/contactUsBg1.png";
import logo from "../../assets/Images/logo.svg";
import { CiUser } from "react-icons/ci";
import { HiOutlineMail } from "react-icons/hi";
import { MdOutlinePhone } from "react-icons/md";
import { FaFacebookSquare } from "react-icons/fa";
import { PiInstagramLogoFill } from "react-icons/pi";
import { FaXTwitter } from "react-icons/fa6";
const ContactUsPage = () => {
  return (
    <>
      <div className="font-abcRepro mt-40">
        {" "}
        <div className="blue-blur-circle"></div>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-10 w-full min-h-[700px] ">
          <div className="bg-[#01071C] rounded-2xl p-5 space-y-3 w-full">
            <img src={logo} className="w-40 h-auto" />
            <h4 className="text-3xl font-bold ">We’d love to help</h4>
            <p className="font-Inter text-sm font-light">
              We’re a full services agency with experts ready to help. We’ll get
              in touch within 24 hours.
            </p>
            <div className="w-full mt-10">
              <form className="flex items-center justify-between flex-wrap w-full space-y-4">
                <div className="flex flex-col items-start text-[#C9CFE5] w-[48%] space-y-2">
                  <label
                    className="font-Inter  text-sm font-light"
                    htmlFor="firstName"
                  >
                    First name
                  </label>
                  <div className="flex items-center gap-2 placeholder:text-[#C9CFE5] text-white bg-[#151B2D] rounded-lg px-2 w-full py-3">
                    <CiUser className="text-xl" />
                    <input
                      type="text"
                      placeholder="Jhon"
                      name="firstName"
                      className="outline-none border-none bg-transparent w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start text-[#C9CFE5] w-[48%] space-y-2">
                  <label htmlFor="lastName">Last name</label>
                  <div className="flex items-center gap-2 placeholder:text-[#C9CFE5] text-white bg-[#151B2D] rounded-lg px-2 w-full py-3">
                    <CiUser className="text-xl" />
                    <input
                      type="text"
                      placeholder="Carter"
                      name="lastName"
                      className="outline-none border-none bg-transparent w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start text-[#C9CFE5] w-full space-y-2">
                  <label
                    htmlFor="email"
                    className="font-Inter  text-sm font-light"
                  >
                    E-Mail address
                  </label>
                  <div className="flex items-center gap-2 placeholder:text-[#C9CFE5] text-white bg-[#151B2D] rounded-lg px-2 w-full py-3">
                    <HiOutlineMail className="text-xl text-[#c9cfe5]" />
                    <input
                      type="text"
                      placeholder="Example@youremail.com"
                      name="email"
                      className="outline-none border-none bg-transparent w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start text-[#C9CFE5] w-full space-y-2">
                  <label
                    htmlFor="phone"
                    className="font-Inter  text-sm font-light"
                  >
                    Mobile Number
                  </label>
                  <div className="flex items-center gap-2 placeholder:text-[#C9CFE5] text-white bg-[#151B2D] rounded-lg px-2 w-full py-3">
                    <MdOutlinePhone className="text-xl text-[#c9cfe5]" />
                    <input
                      type="text"
                      placeholder="+91 xxxx-xxxx-xx"
                      name="phone"
                      className="outline-none border-none bg-transparent w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start text-[#C9CFE5] w-full space-y-2">
                  <label
                    htmlFor="message"
                    className="font-Inter  text-sm font-light"
                  >
                    Message
                  </label>
                  <div className="flex items-center gap-2 placeholder:text-[#C9CFE5] text-white bg-[#151B2D] rounded-lg px-2 w-full py-3">
                    <textarea
                      name="message"
                      placeholder="Leave us a message..."
                      className="outline-none border-none bg-transparent w-full resize-none max-h-20"
                    ></textarea>
                  </div>
                </div>
                <button className="w-full bg-primary mt-5 py-5 rounded-lg">
                  Send message
                </button>
              </form>
            </div>
          </div>
          <div className="bg-[url(./assets/Images/contactUsBg.png)]  overflow-hidden bg-center bg-no-repeat object-contain rounded-2xl lg:block flex flex-col items-center">
            <img src={contactUsBg} className="lg:ml-16   mt-10 lg:rounded-l-2xl rounded-2xl" />
            <div className="flex justify-start gap-3 lg:text-4xl text-2xl lg:ml-20 lg:mt-10 mt-5 lg:pb-0 pb-10  ">
              <PiInstagramLogoFill />
              <FaFacebookSquare />
              <FaXTwitter />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUsPage;
