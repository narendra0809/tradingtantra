import { useEffect, useRef, useState } from "react";
import folderimg from "../../assets/Images/Dashboard/FeedbackImg/folderImg.png";
import { CiUser } from "react-icons/ci";

import { Loader } from "lucide-react";
import axios from "axios";
import Lock from "../../Components/Dashboard/Lock";
import Cookies from "js-cookie";
const URI = import.meta.env.VITE_SERVER_URI;
const FeedBackPage = () => {
  const fileInputRef = useRef(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    feedback: "",
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        `${URI}/post-feedback`,
        {
          name: formData.name,
          category: formData.category,
          message: formData.feedback,
        },
        { withCredentials: true }
      );
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      console.log(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    setFormData({
      name: "",
      number: "",
      category: "",
      feedback: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  return (
    <div className="bg-db-primary not-dark:bg-primary-light  relative  rounded-2xl p-5 space-y-3 w-full md:w-4/5  lg:w-1/2 md:mx-auto mt-10">
      {loading && (
        <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      )}
      <h4 className="text-3xl text-center font-medium font-Inter">Feed Back</h4>
      <div className="w-full mt-10">
        {!isSubscribed ? (
          <Lock />
        ) : (
          <form
            className="flex items-center justify-between flex-wrap w-full space-y-4 bg-[#EEEEEE] p-[5px]"
            onSubmit={handleFormSubmit}
          >
            <div className="flex flex-col items-start  w-full space-y-2">
              <label className="text" htmlFor="name">
                Name
              </label>
              <div className="flex items-center gap-2 dark:placeholder:text-white  dark:bg-[#151B2D] border dark:border-none border-black rounded-lg px-2 w-full py-2">
                <CiUser className="text-xl dark:text-white" />
                <input
                  type="text"
                  placeholder="Jhon"
                  value={formData.name}
                  onChange={handleChange}
                  name="name"
                  className="outline-none border-none bg-transparent w-full"
                />
              </div>
            </div>
            {/* <div className="flex flex-col items-start dark:text-white w-full space-y-2">
            <label htmlFor="phone" className="font-Inter text-sm font-light">
              Whatsapp Number
            </label>
            <div className="flex items-center gap-2 dark:placeholder:text-white  dark:bg-[#151B2D] border dark:border-none border-black rounded-lg px-2 w-full py-2">
              <MdOutlinePhone className="text-xl dark:text-white" />
              <input
                type="text"
                placeholder="+91 xxxx-xxxx-xx"
                name="number"
                value={formData.number}
                onChange={handleChange}
                maxLength={10}
                minLength={10}
                className="outline-none border-none bg-transparent w-full"
              />
            </div>
          </div> */}
            <div className="flex flex-col items-start dark:text-white w-full space-y-2">
              <label
                htmlFor="category"
                className="font-Inter  text-sm font-light"
              >
                Select Category
              </label>
              <div className="flex items-center gap-2 dark:placeholder:text-white  dark:bg-[#151B2D] border dark:border-none border-black rounded-lg px-2 w-full py-2">
                <input
                  type="text"
                  placeholder="Select Category"
                  name="category"
                  onChange={handleChange}
                  value={formData.category}
                  className="outline-none border-none bg-transparent w-full"
                />
              </div>
            </div>

            <div className="flex flex-col items-center dark:text-white w-full space-y-5 dark:bg-[#151B2D] border dark:border-none border-black rounded-lg px-2 py-2">
              <img className="w-16 h-16" src={folderimg} />
              <p className="text-base font-Inter font-light ">
                Choose Your File to upload
              </p>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleClick}
                  className="px-4 py-2 bg-primary text-white rounded-md font-Inter "
                >
                  Browse File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => console.log(e.target.files[0])}
                />
              </div>
            </div>

            <div className="flex flex-col items-start dark:text-white w-full space-y-2">
              <label
                htmlFor="feedback"
                className="font-Inter  text-sm font-light"
              >
                Feedback
              </label>
              <div className="flex items-center gap-2 dark:placeholder:text-white  dark:bg-[#151B2D] border dark:border-none border-black rounded-lg px-2 w-full py-2">
                <textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  placeholder="Enter Your Feedback Here"
                  className="outline-none border-none bg-transparent w-full resize-none h-30"
                ></textarea>
              </div>
            </div>
            <button
              className="w-full bg-primary mt-5 py-5 rounded-lg text-white"
              type="submit"
            >
              Send feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedBackPage;
