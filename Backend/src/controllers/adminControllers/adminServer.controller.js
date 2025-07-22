import { initiateRestart } from "../../utils/server-restart.js";
export const isProduction = process.env.NODE_ENV === "PRODUCTION";
export const pm2Command = isProduction
  ? "pm2 restart all"
  : "pm2 restart dev-backend";
export const restartServer = (req, res) => {
  res.status(202).json({ message: "Server restart scheduled" });
  initiateRestart(pm2Command);
};
