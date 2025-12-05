import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/Images/logo.svg";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Updates", path: "/updates" },
    { name: "Testimonial", path: "/testimonial" },
    { name: "FAQ", path: "/faq" },
    { name: "About Us", path: "/about-us" },
    { name: "Contact Us", path: "/contact-us" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <header
        className={`w-full sticky top-0 z-20 transition-all duration-300 ${
          isScrolled ? "bg-[#02000E]/90 backdrop-blur-md py-2" : "py-4"
        }`}
      >
        <div className="mx-auto flex justify-between items-center  xl:px-20 px-1 py-4">
          {/* Logo */}
          <div className="xl:w-auto lg:w-42 sm:w-40 w-30">
            <Link to="/">
              <img src={logo} alt="logo" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="bg-[#0256F533]  px-[26px] py-[13px] rounded-[50px] lg:block hidden border border-[#0A7CFF33] backdrop-blur-lg">
            <ul className="flex xl:gap-10 lg:gap-5 gap-3 text-base font-normal uppercase">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:text-primary transition-all duration-300"
                >
                  <Link to={item.path}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Buttons */}
          <div className="flex sm:gap-5 gap-4 items-center">
            {token ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="text-[11px] md:text-lg lg:text-lg cursor-pointer font-semibold px-6 py-3 rounded-lg h-12 w-30 sm:flex justify-center items-center bg-linear-to-b from-[#0256F5] to-[#74A4FE] text-white"
              >
                Dashboard
              </button>
            ) : (
              // <button
              //   onClick={() => navigate("/login")}
              //   className="text-[11px] md:text-lg lg:text-lg cursor-pointer font-semibold px-3 py-3 rounded-[20px] bg-blue-600 hover:brightness-125"
              // >
              //   Login
              // </button>
              <button
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="relative overflow-hidden bg-linear-to-b from-[#0256F5] to-[#74A4FE] text-white px-6 py-3 rounded-lg h-12 w-30 sm:flex justify-center items-center hidden"
              >
                <motion.span
                  initial={{ y: 0, opacity: 1 }}
                  animate={
                    hovered ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }
                  }
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <Link to="/login">Login</Link>
                </motion.span>

                <motion.span
                  initial={{ y: 20, opacity: 0 }}
                  animate={
                    hovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }
                  }
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <Link to="/login">Login</Link>
                </motion.span>
              </button>
            )}
            <button
              className="block w-full h-full px-3 py-3 rounded-[calc(0.5rem-0.9px)] bg-[#0256F5] text-white"
              onClick={() => {
                const section = document.getElementById("buy-now-section");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Buy Now
            </button>

            {/* Hamburger Menu (For Mobile) */}
            <GiHamburgerMenu
              className="lg:hidden text-2xl cursor-pointer"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.4 }}
          className="fixed top-0 right-0 w-2/3 sm:w-1/2 h-full bg-[#0256F533] backdrop-blur-lg border-l border-[#0A7CFF33] z-30 text-white flex flex-col items-center py-10 px-6"
        >
          <IoClose
            className="text-3xl absolute top-5 right-5 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          <ul className="flex flex-col gap-6 text-lg font-medium mt-10 uppercase">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer hover:text-primary transition-all duration-300"
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/40 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
