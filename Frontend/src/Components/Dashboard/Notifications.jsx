import { CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const dummyData = [
        {
          id: 1,
          type: "comment",
          user: "Sophie Moore",
          action: "commented on your post.",
          message: "This is looking great! Let's get started on it.",
          date: "Mar 30, 2025",
          time: "Friday 09:03 AM",
          avatar: "https://i.pravatar.cc/40?img=1",
        },
        {
          id: 2,
          type: "follow",
          user: "Matt Cannon",
          action: "just followed your work.",
          date: "Mar 28, 2025",
          time: "Thursday 12:24 PM",
          avatar: "https://i.pravatar.cc/40?img=2",
        },
        {
          id: 3,
          type: "message",
          user: "John Carter",
          action: "just received the mail you sent.",
          date: "Mar 26, 2025",
          time: "Tuesday 2:32 PM",
          avatar: "https://i.pravatar.cc/40?img=3",
        },
        {
          id: 4,
          type: "upload",
          user: "Lilly Woods",
          action: "uploaded 2 files.",
          files: [
            { name: "analytics-report.pdf", link: "#" },
            { name: "ui-style-guide.fig", link: "#" },
          ],
          date: "Mar 24, 2025",
          time: "Monday 6:12 AM",
          avatar: "https://i.pravatar.cc/40?img=4",
        },
        {
          id: 5,
          type: "completion",
          user: "Matt Cannon",
          action: "just completed Careers page.",
          date: "Mar 22, 2025",
          time: "Sunday 7:24 PM",
          avatar: "https://i.pravatar.cc/40?img=5",
        },
      ];
      setNotifications(dummyData);
    };

    fetchNotifications();
  }, []);

  return (
    <div className="max-w-lg mx-auto p-6 dark:bg-[#01071C] bg-db-primary-light  rounded-xl   mt-10">
      {/* Header */}
      <div className="flex justify-between items-center pb-4">
        <h2 className="text-base font-semibold">Notifications</h2>
        <div className="flex gap-2 items-center">
          <button className="text-[11px]  cursor-pointer flex items-center gap-x-2">
         <CheckCheck size={15}  /> Mark all as read
          </button>
          <button className="bg-[#0256F5] text-white  px-3 py-2 rounded-full text-[10px]">
            View all notifications
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 text-sm ${
            activeTab === "all"
              ? "border-b-2 border-[#0256F5]"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("all")}
        >
          View All
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            activeTab === "mentions"
              ? "border-b-2 border-[#0256F5] "
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("mentions")}
        >
          Mentions
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hidden">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex gap-3 items-start p-3  rounded-md"
          >
            <img
              src={notification.avatar}
              alt={notification.user}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="text-[12px] ">
                <span className="font-semibold text-sm">{notification.user}</span>{" "}
                {notification.action}
              </p>
              {notification.message && (
                <div className="bg-[#04102E] p-2 mt-2 rounded-md text-sm text-gray-300">
                  {notification.message}
                </div>
              )}
              {notification.files && (
                <div className="mt-2 space-y-1">
                  {notification.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-[#04102E] p-2 rounded-md"
                    >
                      <span className="text-sm text-gray-300">{file.name}</span>
                      <button className="text-[#0256F5] text-sm">⬇</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs flex justify-between items-center text-gray-400 mt-1">
               <span> {notification.time}</span>  <span>{notification.date}</span>
              </div>
            </div>
            <div className="text-[#0256F5] text-sm">•</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
