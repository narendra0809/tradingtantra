import express from "express";
import morgan from "morgan";
// import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import http from "http";
import "./delete.js";
import "./src/config/passport.js";
import { fetchAndSaveAllUnderlyings } from "./src/services/optionChain.service.js";
import authRoutes from "./src/routes/auth.routes.js";
import stocksRoutes from "./src/routes/stock.routes.js";
import feedbackRoute from "./src/routes/feedback.route.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import holidaysRoutes from "./src/routes/holidays.route.js";
import adminAuthRoutes from "./src/routes/admin_routes/adminAuth.route.js";
import transactionsRoutes from "./src/routes/admin_routes/transactions.route.js";
import updatesRoutes from "./src/routes/admin_routes/adminUpdates.route.js";
import userDetailsRoutes from "./src/routes/admin_routes/usersDetails.route.js";
import adminImageRoutes from "./src/routes/admin_routes/adminImages.route.js";
import adminKeysRoutes from "./src/routes/admin_routes/adminKeys.route.js";
import adminServerRoutes from "./src/routes/admin_routes/adminServer.route.js";
import adminStrategyRoutes from "./src/routes/admin_routes/adminStrategy.route.js";
import adminTickerRoutes from "./src/routes/admin_routes/adminTicker.route.js";
import adminDetailsRoutes from "./src/routes/admin_routes/adminDetails.route.js";
import subcriptionValidityRoutes from "./src/routes/subcriptionValidity.route.js";
import swingTradeRoutes from "./src/routes/SwingTrades.routes.js";
import compression from "compression";
import isSubscribedRoute from "./src/routes/isSubscribed.js";
import { initializeServer } from "./src/config/socket.js";
import "./src/jobs/workers/FiveMinData.js";
import "./src/jobs/workers/LiveData.js";
import "./src/jobs/liveMarket.job.js";
import "./src/jobs/AfterMarket.job.js";
import "./src/jobs/holiday.job.js";
import "./src/jobs/FiiDiiJob.js";
import optionClockRoutes from "./src/routes/optionClock.js";
import smartMoneyActionJob from "./src/jobs/SmartMoneyAction.job.js";
import path from "path";
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  "/assets",
  express.static(path.join(import.meta.dirname, "../Frontend/src/assets"))
);
app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));

app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

initializeServer(server);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4173",
      "https://tradingtantra.in",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(compression());
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use(
  "/api",
  stocksRoutes,
  subcriptionValidityRoutes,
  feedbackRoute,
  isSubscribedRoute,
  swingTradeRoutes,
  optionClockRoutes,
  optionClockRoutes,
  holidaysRoutes
);

// Admin Routes :
app.use("/api/admin/auth", adminAuthRoutes);
app.use(
  "/api/admin",
  adminDetailsRoutes,
  userDetailsRoutes,
  transactionsRoutes,
  updatesRoutes,
  adminStrategyRoutes,
  adminKeysRoutes,
  adminImageRoutes,
  adminTickerRoutes,
  adminServerRoutes
);

app.get("/api/option-chain/trigger", async (req, res) => {
  try {
    console.log("Manually triggering option chain fetch...");
    const result = await fetchAndSaveAllUnderlyings();
    res.json({
      success: true,
      message: "Option chain data fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Manual trigger error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching option chain data",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server started on port", PORT);
      smartMoneyActionJob.start();
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB", error);
  });
process.on("SIGINT", () => {
  smartMoneyActionJob.stop();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
export { app, server };
