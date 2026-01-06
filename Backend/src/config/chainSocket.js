import { buildOptionInsiderPayload } from "../services/optionInsider.service.js";
import { buildOptionClockPayload } from "../services/optionClock.service.js";

let mainIo = null;

/**
 * Initialize chain socket handlers on the main Socket.IO instance
 * @param {SocketIO.Server} io - The main Socket.IO server instance
 */
export function initializeChainSocket(io) {
  if (!io) {
    throw new Error("Main Socket.IO instance is required");
  }

  if (mainIo) {
    console.log("✅ Chain Socket handlers already initialized");
    return;
  }

  mainIo = io;

  // OptionInsider and OptionClock handlers
  io.on("connection", async (socket) => {
    let currentRoom;

    socket.on("subscribeOptionInsider", async ({ index, expiry, interval }) => {
      try {
        if (!index || !interval || !expiry) {
          socket.emit("optionInsiderError", {
            message: "index, interval and expiry are required",
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

    socket.on("subscribeOptionClock", async ({ index, expiry, startTime, endTime }) => {
      try {
        if (!index || !expiry) {
          socket.emit("optionClockError", {
            message: "index and expiry are required",
          });
          return;
        }

        if (currentRoom) {
          socket.leave(currentRoom);
        }

        socket.optionClockSubscription = { index, expiry, startTime, endTime };

        currentRoom = `optionClock_${index}_${expiry}`;

        socket.join(currentRoom);

        const payload = await buildOptionClockPayload({ index, expiry, startTime, endTime });

        socket.emit("optionClockUpdate", payload);
      } catch (error) {
        console.error("Error handling subscribeOptionClock:", error);
        socket.emit("optionClockError", { message: "Internal server error" });
      }
    });
  });

  console.log("✅ Chain Socket handlers initialized on main Socket.IO server");
}

/**
 * Get the main Socket.IO instance
 */
export function getChainSocketInstance() {
  if (!mainIo) {
    throw new Error("Chain Socket handlers not initialized");
  }
  return mainIo;
}

/**
 * Emit an event to all connected sockets
 */
export function emitChainUpdate(event, data) {
  if (!mainIo || !mainIo.engine) {
    console.warn(`⚠️ Main Socket not ready for event: ${event}`);
    return false;
  }
  try {
    mainIo.emit(event, data);
    console.log(`📡 Chain emit: ${event}`);
    return true;
  } catch (error) {
    console.error(`❌ Chain emit failed ${event}:`, error.message);
    return false;
  }
}

/**
 * Broadcast option insider updates to subscribed sockets
 */
export async function broadcastChainOptionInsider({ index, expiry }) {
  if (!mainIo) {
    console.warn("⚠️ Main socket not available for optionInsider broadcast");
    return;
  }

  const sockets = await mainIo.fetchSockets();
  console.log(
    `📡 Broadcasting optionInsider to ${sockets.length} sockets`
  );

  for (const socket of sockets) {
    const sub = socket.optionInsiderSubscription;
    if (!sub || sub.index !== index || sub.expiry !== expiry) continue;

    try {
      const payload = await buildOptionInsiderPayload(sub);
      const room = `optionInsider_${sub.index}_${sub.expiry || "all"}_${
        sub.interval
      }`;
      mainIo.to(room).emit("optionInsiderUpdate", payload);
    } catch (err) {
      console.error(
        `Error sending optionInsider to socket ${socket.id}:`,
        err
      );
    }
  }
}
