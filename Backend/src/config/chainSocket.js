import { Server } from "socket.io";
import express from "express";
import http from "http";
import cors from "cors";
import { buildOptionInsiderPayload } from "../services/optionInsider.service.js";
import checkSubscription from "../middlewares/checkSubscription.js";
import authenticateSocket from "../middlewares/authenticateSocket.js";

let chainIo = null;

const chainApp = express();
const chainServer = http.createServer(chainApp);

chainApp.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4173",
      "https://tradingtantra.in",
    ],
    credentials: true,
  })
);

export function initializeChainSocket() {
  if (chainIo) {
    console.log("✅ Chain Socket.IO already initialized");
    return chainIo;
  }

  chainIo = new Server(chainServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4173",
        "https://tradingtantra.in",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Chain socket middleware (same as main)
  chainIo.use(authenticateSocket);
  chainIo.use(checkSubscription);

  // OptionInsider handlers moved here
  chainIo.on("connection", async (socket) => {
    console.log("🔗 Chain socket user connected:", socket.id);

    let currentRoom;
    socket.on("subscribeOptionInsider", async ({ index, expiry, interval }) => {
      try {
        if (!index || !interval || !expiry) {
          socket.emit("optionInsiderError", {
            message: "index , interval and expiry are required",
          });
          return;
        }

        if (currentRoom) {
          socket.leave(currentRoom);
        }

        socket.optionInsiderSubscription = { index, expiry, interval };

        currentRoom = `optionInsider_${index}_${expiry || "all"}_${interval}`;

        socket.join(currentRoom);

        const payload = await buildOptionInsiderPayload({
          index,
          expiry,
          interval,
        });
        socket.emit("optionInsiderUpdate", payload);
      } catch (error) {
        console.error("Error handling subscribeOptionInsider:", error);
        socket.emit("optionInsiderError", { message: "Internal server error" });
      }
    });

    socket.on("disconnect", () => {
      console.log("🔗 Chain socket user disconnected:", socket.id);
    });
  });

  console.log("🔗 Chain Socket.IO initialized with optionInsider support");
  return chainIo;
}

export function getChainSocketInstance() {
  if (!chainIo) {
    throw new Error("Chain Socket.IO not initialized");
  }
  return chainIo;
}

export function emitChainUpdate(event, data) {
  if (!chainIo || !chainIo.engine) {
    console.warn(`⚠️ Chain Socket not ready for event: ${event}`);
    return false;
  }
  try {
    chainIo.emit(event, data);
    console.log(`📡 Chain emit: ${event}`);
    return true;
  } catch (error) {
    console.error(`❌ Chain emit failed ${event}:`, error.message);
    return false;
  }
}

export async function broadcastChainOptionInsider({ index, expiry }) {
  if (!chainIo) {
    console.warn("⚠️ Chain socket not available for optionInsider broadcast");
    return;
  }

  const sockets = await chainIo.fetchSockets();
  console.log(
    `📡 Broadcasting optionInsider to ${sockets.length} chain sockets`
  );

  for (const socket of sockets) {
    const sub = socket.optionInsiderSubscription;
    if (!sub || sub.index !== index || sub.expiry !== expiry) continue;

    try {
      const payload = await buildOptionInsiderPayload(sub);
      const room = `optionInsider_${sub.index}_${sub.expiry || "all"}_${
        sub.interval
      }`;
      chainIo.to(room).emit("optionInsiderUpdate", payload);
    } catch (err) {
      console.error(
        `Error sending chain optionInsider to socket ${socket.id}:`,
        err
      );
    }
  }
}

export function closeChainSocket() {
  if (chainIo) {
    chainIo.close();
    chainIo = null;
    console.log("🔌 Chain Socket.IO closed");
  }
  chainServer.close();
}

export { chainServer };
