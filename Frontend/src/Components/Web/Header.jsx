import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/Images/logo.svg";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // React Router navigation

  // Menu items with paths
  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Updates", path: "/updates" },
    { name: "Testimonial", path: "/testimonial" },
    { name: "FAQ", path: "/faq" },
    { name: "About Us", path: "/about-us" },
    { name: "Contact Us", path: "/contact-us" },
  ];

  return (
    <>
      <header className="w-full mt-5 absolute top-6 z-20 mx-auto flex justify-between items-center text-white xl:px-20 sm:px-10 px-5">
        {/* Logo */}
        <div className="xl:w-auto lg:w-42 sm:w-40 w-30">
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="bg-[#0256F533] text-white px-[26px] py-[13px] rounded-[50px] lg:block hidden border border-[#0A7CFF33] backdrop-blur-lg">
          <ul className="flex xl:gap-10 lg:gap-5 gap-3 text-base font-normal uppercase">
            {menuItems.map((item, index) => (
              <li key={index} className="cursor-pointer hover:text-primary transition-all duration-300">
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Buttons */}
        <div className="flex sm:gap-5 gap-4 items-center">
          <button className="sm:text-base text-sm">Login</button>
          <button className="neon-button sm:text-base text-sm bg-black cursor-pointer font-semibold px-6 py-3 rounded-[20px]">
            Buy Now
          </button>

          {/* Hamburger Menu (For Mobile) */}
          <GiHamburgerMenu className="lg:hidden text-2xl cursor-pointer" onClick={() => setIsOpen(true)} />
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
          {/* Close Button */}
          <IoClose className="text-3xl absolute top-5 right-5 cursor-pointer" onClick={() => setIsOpen(false)} />

          {/* Sidebar Navigation */}
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

      {/* Overlay (Click outside to close) */}
      {isOpen && <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-20" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Header;
