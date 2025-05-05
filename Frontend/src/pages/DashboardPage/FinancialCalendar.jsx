import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import default styles
import companyLogo from "../../assets/Images/Dashboard/financialCalendar/companyLogo.png";
import { BsSearch } from "react-icons/bs";
import { useSelector } from "react-redux";
const FinancialCalendar = () => {
  const [date, setDate] = useState(new Date());
  const today = new Date();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [category, setCategory] = useState("Select Category");
const theme =useSelector((state)=>state.theme.theme)
  const categories = [
    "Corporate Actions",
    "Board Meeting",
    "Events",
    "Bonus Issue",
    "Holiday",
    "Dividend",
    "Stock Split",
    "Buyback of Shares",
  ];

  const [input, setInput] = useState({
    from: "text",
    to: "text",
  });
  const handleFocus = (field) => {
    setInput((prev) => ({
      ...prev,
      [field]: "date",
    }));
  };

  const handleBlur = (field) => {
    setInput((prev) => ({
      ...prev,
      [field]: "text",
    }));
  };

  const eventData = [
    {
      event: "Dividend",
      company: "ASTERDM",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
    {
      event: "Dividend",
      company: "INDTONER",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
    {
      event: "Dividend",
      company: "ASTERDM",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
    {
      event: "Dividend",
      company: "INDTONER",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
    {
      event: "Dividend",
      company: "ASTERDM",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
    {
      event: "Dividend",
      company: "INDTONER",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
    {
      event: "Dividend",
      company: "ASTERDM",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
    {
      event: "Dividend",
      company: "INDTONER",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
    {
      event: "Dividend",
      company: "ASTERDM",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
    {
      event: "Dividend",
      company: "INDTONER",
      eventDetail: "Interim Dividend - Rs. - 4,0000",
      img: companyLogo,
    },
  ];

  const entriesData = [
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Special Holiday",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Repubic Day",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Mahashivratri",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Holi",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Dividend",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Fund Raising",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Special Holiday",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Special Holiday",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Special Holiday",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Special Holiday",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Special Holiday",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Special Holiday",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Repubic Day",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Mahashivratri",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Holi",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Dividend",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Fund Raising",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Special Holiday",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Special Holiday",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Board Metting",
      Description: "Special Holiday",
      Symbol: "SUNTV",
      Name: "Sun TVNetwork Limited",
    },
    {
      Date: "2024-01-22",
      Heading: "Holiday",
      Description: "Special Holiday",
      Symbol: "PNB",
      Name: "Punjab National Bank",
    },
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const totalPages = Math.ceil(entriesData.length / entriesPerPage);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = entriesData.slice(indexOfFirstEntry, indexOfLastEntry);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  
  return (
    <>
        <h2 className="mt-5 text-3xl font-semibold ">Financial Calendar</h2>
      <div className="w-full flex items-start lg:gap-y-0 gap-y-5 lg:flex-row flex-col my-5 ">
        {/* left section */}
        <section className="rounded-lg w-full lg:max-w-md   bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px  mr-5">
          <div className="dark:bg-db-primary bg-db-primary-light w-full rounded-lg p-2.5 ">
            <div className="flex flex-col items-center dark:bg-db-primary bg-db-primary-light shadow-lg rounded-sm w-full">
              <Calendar
                onChange={setDate}
                value={date}
                locale="en-US"
                className={`${theme==="dark"?"custom-calendar-dark": "custom-calendar"}`}
                tileClassName={({ date }) => {
                  const day = date.getDay();
                  if (date.toDateString() === today.toDateString())
                    return "current-date"; // Highlight current date
                  if (day === 0) return "sunday-tile"; // Highlight Sundays
                  if (day === 6) return "saturday-tile"; // Highlight Saturdays
                  return "";
                }}
              />
            </div>
            <div className="grid grid-cols-3 dark:bg-db-secondary bg-primary-light mt-2.5 gap-y-2 p-4 ">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FC5C5D]"></div>
                <p className="text-xs">Corporate Actions</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#BB61FF]"></div>
                <p className="text-xs">Board Metting</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#5AD12A]"></div>
                <p className="text-xs">Events</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#6169FF]"></div>
                <p className="text-xs">Bonus Issue</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#837AFF]"></div>
                <p className="text-xs">Holiday</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF61E4]"></div>
                <p className="text-xs">Dividend</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1F9B51]"></div>
                <p className="text-xs">Stock Split</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E1B12A]"></div>
                <p className="text-xs">Buyback of Shares</p>
              </div>
            </div>
          </div>
        </section>{" "}
        {/* right section */}
        <section className="rounded-lg w-full  bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px ">
          <div className="w-full dark:bg-db-primary bg-db-primary-light  p-5">
            <h3 className="font-medium text-2xl text-center">
              Event Date: 10 February, 2025
            </h3>
            <div className="w-full dark:bg-db-primary bg-db-primary-light h-[340px] overflow-y-auto scrollbar-hidden">
              <div className="flex flex-col gap-y-5 mt-8  ">
                {eventData.map((event, index) => (
                  <div key={index} className="space-y-2 ">
                    <p className="text-primary font-light text-base">
                      {event.event}
                    </p>

                    <div className=" w-full dark:bg-db-primary bg-db-secondary-light p-2 rounded-lg flex border border-[#0356F5] justify-between">
                      <div>
                        <p className="text-base font-normal">{event.company}</p>
                        <p className="text-[10px] font-light">
                          {event.eventDetail}
                        </p>
                      </div>
                      <img
                        src={event.img}
                        className="w-10 h-10 rounded-full"
                        alt=""
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* date form */}
      <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px rounded-md">
        <div className="dark:bg-db-primary bg-db-primary-light w-full p-5 rounded-md">
          <h2 className="text-2xl font-medium mb-5">Calendar Events</h2>
          <div className="dark:bg-db-secondary bg-db-secondary-light">
            <form className="grid grid-cols-2 p-5 gap-4 ">
              <div>
                <label htmlFor="fromDate" >From Date</label>
                <div
                  className="w-full flex items-center justify-between dark:bg-db-primary bg-primary-light rounded-[10px] px-2 py-4"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents unnecessary event bubbling
                    document.getElementById("fromDateInput").showPicker();
                  }}
                >
                  <input
                    id="fromDateInput"
                    type="date"
                    className="w-full border-none outline-none"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="toDate" >To Date</label>
                <div
                  className="w-full flex items-center justify-between dark:bg-db-primary bg-primary-light rounded-[10px] px-2 py-4"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents unnecessary event bubbling
                    document.getElementById("toDateInput").showPicker();
                  }}
                >
                  <input
                    id="toDateInput"
                    type="date"
                    className="w-full border-none outline-none"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="category" >Category</label>
                <div
                  className="w-full flex items-center justify-between dark:bg-db-primary bg-primary-light  rounded-[10px] px-2 py-4 cursor-pointer"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span>{category}</span>
                </div>
                {showDropdown && (
                  <ul className="absolute w-full dark:bg-db-primary bg-db-primary-light mt-1 rounded-lg shadow-lg z-10">
                    {categories.map((item, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-primary cursor-pointer"
                        onClick={() => {
                          setCategory(item);
                          setShowDropdown(false);
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-3 mt-5 ">
                <button className="px-5 py-3 rounded-lg w-full cursor-pointer bg-[#085AF5]">
                  Submit
                </button>
                <button
                  className="px-5 py-3 rounded-lg w-full cursor-pointer bg-[#085AF5]"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                    setCategory("Select Category");
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* entries */}
      <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px mt-5 rounded-md">
        <div className="dark:bg-db-primary bg-db-primary-light w-full p-5 rounded-md">
          {/* Header Section */}
          <div className="flex justify-between  mb-4">
            <h2 className="text-2xl font-light">
              Total Entries: {entriesData.length}
            </h2>
            <div className="flex items-center px-2 py-2  bg-[#085AF5] rounded-sm">
              <input
                type="text"
                name="searchEntries"
                className="bg-transparent outline-none border-none grow  "
                placeholder="Search..."
              />
              <BsSearch />
            </div>
          </div>

          {/* Entries Table */}
          <div className="dark:bg-db-secondary bg-primary-light rounded-md">
            {/* Table Header */}
            <div className="w-full grid grid-cols-5 px-10 font-semibold   py-2">
              <p>Date</p>
              <p>Heading</p>
              <p>Description</p>
              <p>Symbol</p>
              <p>Name</p>
            </div>

            {/* Table Body */}
            <div className="border-t border-primary px-10 w-full min-h-[400px] mt-3 pt-3">
              {currentEntries.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5  py-2 dark:text-gray-200 "
                >
                  <p className="text-sm">{entry.Date}</p>
                  <p className="text-sm">{entry.Heading}</p>
                  <p className="text-sm">{entry.Description}</p>
                  <p className="text-sm">{entry.Symbol}</p>
                  <p className="text-sm">{entry.Name}</p>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
              <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={` ${
                  currentPage === 1
                    ? "text-gray-500 cursor-not-allowed"
                    : " dark:text-[#71A2FE] text-primary"
                }`}
              >
               {"<"} Previous
              </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-5 py-1  rounded ${
                      currentPage === i + 1
                        ? "dark:bg-[#00114E] bg-primary-light "
                        : "bg-transparent"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={` ${
                    currentPage === totalPages
                      ? " text-gray-500 cursor-not-allowed"
                      : " dark:text-[#71A2FE] text-primary"
                  }`}
                >
                  Next {">"}
                </button>
              </div>
          )}
        </div>
      </section>
    </>
  );
};

export default FinancialCalendar;
