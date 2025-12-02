import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import optionChainJob from "./src/jobs/optionChain.job.js";
import {
  chainServer,
  initializeChainSocket,
} from "./src/config/chainSocket.js";

dotenv.config();

console.log("Starting option chain job with dedicated WebSocket...");
const CHAIN_SOCKET_PORT = process.env.CHAIN_PORT || 5550;

initializeChainSocket();

chainServer.listen(CHAIN_SOCKET_PORT, "127.0.0.1", () => {
  console.log(`🔗 Chain Socket.IO listening on port ${CHAIN_SOCKET_PORT}`);
});


connectDB()
  .then(() => {
    console.log("Database connected successfully for optionChainJob");
    optionChainJob.start();
  })
  .catch((error) => {
    console.error("Failed to connect to DB for optionChainJob", error);
    process.exit(1);
  });

process.on("SIGINT", () => {
  optionChainJob.stop();
  closeChainSocket();
  console.log("Option chain job & chain sockets stopped");
  process.exit(0);
});
