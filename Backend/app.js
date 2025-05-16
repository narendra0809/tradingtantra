import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import http from "http";
import cron from "node-cron"; 
import "./delete.js";
import "./src/config/passport.js";
import optionChainJob from './src/jobs/optionChain.job.js';
import {getOptionChainData} from './src/controllers/chain.controller.js';
import { fetchAndSaveAllUnderlyings } from "./src/services/optionChain.service.js";
import authRoutes from "./src/routes/auth.routes.js";
import stocksRoutes from "./src/routes/stock.routes.js";
import feedbackRoute from "./src/routes/feedback.route.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import swingTradeRoutes from "./src/routes/SwingTrades.routes.js";
import compression from "compression";
import isSubscribedRoute from "./src/routes/isSubscribed.js";
import { getSocketInstance, initializeServer } from "./src/config/socket.js";
import "./src/jobs/workers/FiveMinData.js";
import "./src/jobs/workers/LiveData.js";
import "./src/jobs/liveMarket.job.js";
import "./src/jobs/AfterMarket.job.js";
import "./src/jobs/holiday.job.js";
import "./src/jobs/FiiDiiJob.js";
import optionClockRoutes from "./src/routes/optionClock.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
initializeServer(server);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://tradingtantra.in"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(compression());
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", stocksRoutes);
app.use("/api", feedbackRoute);
app.use("/api", isSubscribedRoute);
app.use("/api", swingTradeRoutes);
app.use("/api", optionClockRoutes);

// Add this before the server starts
app.get('/api/option-chain/trigger', async (req, res) => {
  try {
    console.log('Manually triggering option chain fetch...');
    const result = await fetchAndSaveAllUnderlyings();
    res.json({
      success: true,
      message: 'Option chain data fetched successfully',
      data: result
    });
  } catch (error) {
    console.error('Manual trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching option chain data',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server started on port", PORT);
      optionChainJob.start();
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB", error);
  });
process.on('SIGINT', () => {
  optionChainJob.stop();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
export { app, server };
