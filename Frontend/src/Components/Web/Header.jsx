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

  const handleBuyNow = () => {
    const section = document.getElementById("buy-now-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className={`w-full sticky top-0 z-20 transition-all duration-300 ${
          isScrolled
            ? "bg-[#02000E]/90 backdrop-blur-md py-2"
            : "py-4"
        }`}
      >
        <div className="mx-auto flex justify-between items-center xl:px-20 px-3">
          {/* Logo */}
          <Link to="/" className="w-32 sm:w-40">
            <img src={logo} alt="logo" />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:block bg-[#0256F533] px-6 py-3 rounded-full border border-[#0A7CFF33] backdrop-blur-lg">
            <ul className="flex gap-6 uppercase text-sm">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className="hover:text-primary transition"
                >
                  <Link to={item.path}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            {/* Login / Dashboard */}
            {token ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-linear-to-b from-[#0256F5] to-[#74A4FE] text-white font-semibold"
              >
                Dashboard
              </button>
            ) : (
              <button
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="hidden sm:flex relative overflow-hidden px-6 py-3 rounded-lg bg-linear-to-b from-[#0256F5] to-[#74A4FE] text-white font-semibold"
                onClick={() => navigate("/login")}
              >
                <motion.span
                  initial={{ y: 0, opacity: 1 }}
                  animate={hovered ? { y: -20, opacity: 0 } : {}}
                  transition={{ duration: 0.3 }}
                >
                  Login
                </motion.span>
              </button>
            )}

            {/* Buy Now (Desktop Only) */}
            <button
              className="hidden lg:block px-6 py-3 rounded-lg bg-[#0256F5] text-white font-semibold"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>

            {/* Hamburger (Mobile) */}
            <GiHamburgerMenu
              className="lg:hidden text-2xl cursor-pointer"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* ================= SIDEBAR ================= */}
      {isOpen && (
        <>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed top-0 right-0 w-3/4 sm:w-1/2 h-full bg-[#0256F533] backdrop-blur-lg border-l border-[#0A7CFF33] z-30 flex flex-col items-center px-6 py-10"
          >
            <IoClose
              className="absolute top-5 right-5 text-3xl cursor-pointer"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Items */}
            <ul className="mt-12 flex flex-col gap-6 uppercase text-lg">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:text-primary"
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                >
                  {item.name}
                </li>
              ))}
            </ul>

            {/* Buy Now (Mobile Only) */}
            <button
              className="mt-10 w-full px-6 py-3 rounded-lg bg-linear-to-b from-[#0256F5] to-[#74A4FE] text-white font-semibold lg:hidden"
              onClick={() => {
                handleBuyNow();
                setIsOpen(false);
              }}
            >
              Buy Now
            </button>
          </motion.div>

          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-20"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default Header;
