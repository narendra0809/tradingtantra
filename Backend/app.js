import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import http from "http";
import "./src/config/passport.js";

// import bodyParser from "body-parser";

import stocksRoutes from "./src/routes/stock.routes.js";
import feedbackRoute from "./src/routes/feedback.route.js";

import { getSocketInstance, initializeServer } from "./src/config/socket.js";

import paymentRoutes from "./src/routes/payment.routes.js";
import swingTradeRoutes from "./src/routes/SwingTrades.routes.js";
import isSubscribedRoute from "./src/routes/isSubscribed.js";
// import scheduleMarketJob from "./src/jobs/liveMarket.job.js";

// import holidayJob from "./src/jobs/holiday.job.js";

import "./src/jobs/workers/FiveMinData.js";
import "./src/jobs/workers/LiveData.js";
import "./src/jobs/liveMarket.job.js";
import "./src/jobs/AfterMarket.job.js";
import "./src/jobs/holiday.job.js";
import "./src/jobs/FiiDiiJob.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(morgan("dev"));

// app.use(bodyParser.json());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(cookieParser());

app.use(passport.initialize());
initializeServer(server);

app.use(
  cors({
    origin: ["http://localhost:3000","http://localhost:5173", "https://tradingtantra.in"], // Replace with your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", stocksRoutes);
app.use("/api", feedbackRoute);
app.use("/api", isSubscribedRoute);
app.use("/api", swingTradeRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server started on port ", PORT);
    });
  })
  .catch((error) => {
    console.log("Failed to connect ", error);
  });

export { app, server };
