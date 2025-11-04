import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import default styles
import companyLogo from "../../assets/Images/Dashboard/financialCalendar/companyLogo.png";
import { useSelector } from "react-redux";
import axios from "axios";
import Lock from "../../Components/Dashboard/Lock";
import Cookies from "js-cookie";
const URI = import.meta.env.VITE_SERVER_URI;

const FinancialCalendar = () => {
  const [date, setDate] = useState(new Date());
  const today = new Date();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  const [holidays, setHolidays] = useState([]);
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
  ];

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(`${URI}/get-holidays`);
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      setHolidays(res.data.holidays);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const holidayDates = holidays.map(
    (holiday) => new Date(holiday.date).toISOString().split("T")[0]
  );

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-calendar, .custom-calendar-dark {
        width: 100%;
        background: transparent;
        border: none;
        color: #fff;
      }
      .custom-calendar .react-calendar__tile,
      .custom-calendar-dark .react-calendar__tile {
        background: transparent;
        color: #fff;
      }
      .current-date {
        background: #0356F5 !important;
        color: #fff !important;
        border-radius: 50%;
      }
      .sunday-tile {
        color: #FF6B6B !important;
      }
      .saturday-tile {
        color: #4CAF50 !important;
      }
      .holiday-tile {
        background: #837AFF !important;
        color: #fff !important;
        border-radius: 50%;
      }
      .react-calendar__tile--active {
        background: #085AF5 !important;
        color: #fff !important;
        border-radius: 50%;
      }
      .react-calendar__navigation button {
        color: #fff;
        background: transparent;
      }
      .react-calendar__month-view__weekdays {
        color: #fff;
        text-decoration: none;
      }
      .scrollbar-hidden::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hidden {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      /* Improved Responsive Table Styles */
      .responsive-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .responsive-table thead th {
        padding: 12px 16px;
        text-align: left;
        background-color: rgba(255, 255, 255, 0.05);
        color: #fff;
        font-weight: 600;
      }
      
      .responsive-table tbody td {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: #d1d5db;
      }
      
      .responsive-table tbody tr:last-child td {
        border-bottom: none;
      }
      
      @media (max-width: 767px) {
        .responsive-table thead {
          display: none;
        }
        
        .responsive-table tbody tr {
          display: block;
          margin-bottom: 16px;
          background: #01071C;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px;
        }
        
        .responsive-table tbody td {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border: none;
          position: relative;
        }
        
        .responsive-table tbody td:not(:last-child) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .responsive-table tbody td::before {
          content: attr(data-label);
          font-weight: 600;
          color: #fff;
          margin-right: 16px;
          flex: 1;
        }
        
        .responsive-table tbody td {
          text-align: right;
          flex: 2;
        }
      }
      
      /* Empty state styling */
      .no-holidays {
        padding: 24px;
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  useEffect(() => {
    const Subscribed = Cookies.get("isSubscribed");
    setIsSubscribed(Subscribed === "true");
  }, []);

  return (
    <>
      <h2 className="mt-5 text-3xl font-semibold">Financial Calendar</h2>
      <div className="w-full flex items-stretch lg:gap-y-0 gap-y-5 lg:flex-row flex-col my-5">
        {/* Left Section: Calendar */}
        <section className="rounded-lg w-full lg:max-w-md bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px mr-0 lg:mr-5">
          {!isSubscribed ? (
            <Lock />
          ) : (
            <div className="dark:bg-db-primary bg-primary-light w-full rounded-lg p-2.5 min-h-[400px] flex flex-col">
              <div className="flex flex-col items-center dark:bg-db-primary bg-primary-light shadow-lg rounded-sm w-full flex-grow">
                <Calendar
                  onChange={setDate}
                  value={date}
                  locale="en-US"
                  className={`${
                    theme === "dark"
                      ? "custom-calendar-dark"
                      : "custom-calendar"
                  }`}
                  tileClassName={({ date }) => {
                    const formattedDate = date.toISOString().split("T")[0];
                    const day = date.getDay();
                    const classes = [];
                    if (date.toDateString() === today.toDateString()) {
                      classes.push("current-date");
                    }
                    if (day === 0) {
                      classes.push("sunday-tile");
                    }
                    if (day === 6) {
                      classes.push("saturday-tile");
                    }
                    if (holidayDates.includes(formattedDate)) {
                      classes.push("holiday-tile");
                    }
                    return classes.join(" ");
                  }}
                />
              </div>
              <div className="grid grid-cols-3 dark:bg-db-secondary bg-primary-light mt-2.5 gap-y-2 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#837AFF]"></div>
                  <p className="text-xs ">Holidays</p>
                </div>
              </div>
            </div>
          )}
        </section>
        {/* Right Section: Event List */}
        <section className="rounded-lg w-full bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px">
          <div className="w-full dark:bg-db-primary bg-primary-light p-5 min-h-[400px] flex flex-col ">
            <h3 className="font-medium text-2xl text-center ">
              Event Date: 10 February, 2025
            </h3>
            <div className="w-full dark:bg-db-primary bg-primary-light h-[340px] overflow-y-auto scrollbar-hidden flex-grow">
              {!isSubscribed ? (
                <Lock />
              ) : (
                <div className="flex flex-col gap-y-5 mt-8">
                  {eventData.map((event, index) => (
                    <div key={index} className="space-y-2">
                      <p className="text-primary  font-light text-base">
                        {event.event}
                      </p>
                      <div className="w-full dark:bg-db-primary bg-primary-light p-2 rounded-lg flex border border-[#0356F5] justify-between">
                        <div>
                          <p className="text-base font-normal">
                            {event.company}
                          </p>
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
              )}
            </div>
          </div>
        </section>
      </div>
      {/* Third Section: Holidays Table */}
      <section className="bg-gradient-to-tr from-[#0009B2] to-[#02000E] p-px mt-5 rounded-md">
        <div className="dark:bg-db-primary bg-primary-light w-full p-5 rounded-md">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-light ">
              Total Holidays: {holidays.length}
            </h2>
          </div>
          <div className="dark:bg-db-secondary bg-primary-light rounded-md overflow-x-auto">
            {!isSubscribed ? (
              <Lock />
            ) : (
              <table className="responsive-table min-w-full">
                <thead className="hidden md:table-header-group ">
                  <tr>
                    <th
                      scope="col"
                      className="text-sm font-semibold "
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-semibold "
                    >
                      Holiday Type
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-semibold "
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="no-holidays">
                        No holidays available
                      </td>
                    </tr>
                  ) : (
                    holidays.map((entry, index) => (
                      <tr key={index}>
                        <td data-label="Date" className="text-sm">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td data-label="Holiday Type" className="text-sm">
                          {entry.holiday_type}
                        </td>
                        <td data-label="Description" className="text-sm">
                          {entry.description}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default FinancialCalendar;
