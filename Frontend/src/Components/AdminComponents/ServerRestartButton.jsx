import axios from "axios";
import { ADMIN_SERVER_URI } from "../../pages/AdminPages/Home";

const ServerRestartButton = () => {
  const restartServer = async () => {
    try {
      const res = await axios.post(
        `${ADMIN_SERVER_URI}/restart-server`,
        {},
        { withCredentials: true }
      );
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleClick = async () => {
    const doRestart = window.confirm("Do you want to restart server ?");
    if (!doRestart) return;
    await restartServer();
  };
  return (
    <button
      onClick={handleClick}
      className="bg-gradient-to-r from-[#d51a49] to-[#d31c32] text-white text-xs px-4 py-1 rounded-md hover:opacity-90 transition-all border border-blue-500 whitespace-nowrap truncate"
    >
      Restart Server
    </button>
  );
};

export default ServerRestartButton;
