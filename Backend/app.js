import express from "express";
import morgan from "morgan";
// import session from "express-session";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import passport from "passport";
import path from "path";
import "./delete.js";
import "./src/config/passport.js";
import { initializeServer, getSocketInstance } from "./src/config/socket.js";
import { initializeChainSocket } from "./src/config/chainSocket.js";
import "./src/jobs/AfterMarket.job.js";
import "./src/jobs/FiiDiiJob.js";
import "./src/jobs/holiday.job.js";
import "./src/jobs/liveMarket.job.js";
import "./src/jobs/workers/FiveMinData.js";
import "./src/jobs/workers/LiveData.js";
import adminAuthRoutes from "./src/routes/admin_routes/adminAuth.route.js";
import adminDetailsRoutes from "./src/routes/admin_routes/adminDetails.route.js";
import adminImageRoutes from "./src/routes/admin_routes/adminImages.route.js";
import adminKeysRoutes from "./src/routes/admin_routes/adminKeys.route.js";
import adminServerRoutes from "./src/routes/admin_routes/adminServer.route.js";
import adminStockRoutes from "./src/routes/admin_routes/adminStocks.route.js";
import adminStrategyRoutes from "./src/routes/admin_routes/adminStrategy.route.js";
import adminTickerRoutes from "./src/routes/admin_routes/adminTicker.route.js";
import updatesRoutes from "./src/routes/admin_routes/adminUpdates.route.js";
import transactionsRoutes from "./src/routes/admin_routes/transactions.route.js";
import userDetailsRoutes from "./src/routes/admin_routes/usersDetails.route.js";
import adminCouponRoutes from "./src/routes/admin_routes/adminCoupon.route.js";
import maintenanceRoutes from "./src/routes/admin_routes/maintenance.route.js";
import maintenancePublicRoutes from "./src/routes/maintenance.routes.js";
import checkMaintenance from "./src/middlewares/checkMaintenance.middleware.js";
import authRoutes from "./src/routes/auth.routes.js";
import feedbackRoute from "./src/routes/feedback.route.js";
import holidaysRoutes from "./src/routes/holidays.route.js";
import isSubscribedRoute from "./src/routes/isSubscribed.js";
import optionClockRoutes from "./src/routes/optionClock.js";
import { optionInsiderRoute } from "./src/routes/optionInsider.route.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import stocksRoutes from "./src/routes/stock.routes.js";
import GetCoupon from "./src/routes/Coupon.route.js";
import subcriptionValidityRoutes from "./src/routes/subcriptionValidity.route.js";
import swingTradeRoutes from "./src/routes/SwingTrades.routes.js";
import userRoutes from "./src/routes/users.route.js";
import { fetchAndSaveAllUnderlyings } from "./src/services/optionChain.service.js";
import { optionClockRouter } from "./src/routes/optionClock.route.js";
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  "/assets",
  express.static(path.join(import.meta.dirname, "../Frontend/src/assets"))
);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));

app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

// Initialize main Socket.IO server
const io = initializeServer(server);

// Initialize chain socket handlers on the main server
initializeChainSocket(io);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4173",
      "https://tradingtantra.in",
      "https://api.tradingtantra.in",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use(compression());

// Maintenance mode check (before all routes except admin routes)
app.use("/api", checkMaintenance);
app.use("/api", maintenancePublicRoutes);
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
  holidaysRoutes,
  optionInsiderRoute,
  optionClockRouter,
  GetCoupon
);

// Admin Routes :
app.use("/api/users", userRoutes);
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
  adminServerRoutes,
  adminStockRoutes,
  adminCouponRoutes,
  maintenanceRoutes
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

export { app, server };
