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
import { fetchAndSaveAllUnderlyings, isTradingHoliday, convertToIST } from "./chain.js";

import authRoutes from "./src/routes/auth.routes.js";
import stocksRoutes from "./src/routes/stock.routes.js";
import feedbackRoute from "./src/routes/feedback.route.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import swingTradeRoutes from "./src/routes/SwingTrades.routes.js";
import isSubscribedRoute from "./src/routes/isSubscribed.js";

import { getSocketInstance, initializeServer } from "./src/config/socket.js";

// Background jobs
import "./src/jobs/workers/FiveMinData.js";
import "./src/jobs/workers/LiveData.js";
import "./src/jobs/liveMarket.job.js";
import "./src/jobs/AfterMarket.job.js";
import "./src/jobs/holiday.job.js";
import "./src/jobs/FiiDiiJob.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
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

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", stocksRoutes);
app.use("/api", feedbackRoute);
app.use("/api", isSubscribedRoute);
app.use("/api", swingTradeRoutes);

const cronExpressions = [
  // '15-59/3 9 * * 1-5',   // 9:15 AM to 9:57 AM
  // '0-59/3 10-14 * * 1-5', // 10:00 AM to 2:57 PM
  // '0-30/3 15 * * 1-5',    // 3:00 PM to 3:30 PM
  "*/3 * * * *" // Every minute for testing
];

async function runScheduledJob() {
  try {
    const now = new Date();
    console.log(`Cron triggered at ${convertToIST(now)}`);
    const isHoliday = await isTradingHoliday(now);
    if (isHoliday) {
      console.log(`Skipping chain data fetch at ${convertToIST(now)} due to NSE trading holiday`);
      return;
    }
    await fetchAndSaveAllUnderlyings();
    console.log(`Chain data fetch completed at ${convertToIST(now)}`);
  } catch (error) {
    console.error(`Error in chain data fetch cron job at ${convertToIST(Date.now())}:`, error.message);
  }
}

const startChainJob = () => {
  console.log("Starting option chain cron job");
  cronExpressions.forEach(expr => {
    cron.schedule(expr, runScheduledJob, { timezone: 'Asia/Kolkata' });
  });
};

// Register cron jobs
cronExpressions.forEach(expr => {
  cron.schedule(expr, runScheduledJob, { timezone: 'Asia/Kolkata' });
});

// Start Server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server started on port", PORT);
      startChainJob();
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB", error);
  });

export { app, server };
