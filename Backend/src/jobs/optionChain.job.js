// import cron from "node-cron";
// import { fetchAndSaveAllUnderlyings } from "../services/optionChain.service.js";
// import {
//   broadcastToAllSubscribedSockets,
//   getSocketInstance,
// } from "../config/socket.js";
// class OptionChainJob {
//   constructor() {
//     this.task = null;
//     this.flag = false;
//   }
//   setFlag() {
//     this.flag = true;
//   }
//   start() {
//     if (this.task) return;

//     this.task = cron.schedule(
//       "*/3 9-15 * * 1-5",
//       async () => {
//         try {
//           console.log("Running option chain data fetch...");
//           await fetchAndSaveAllUnderlyings(this.flag);

//           const io = await getSocketInstance();
//           io.emit("optionChainDataUpdated", {
//             updated: true,
//             timestamp: new Date(),
//           });
//           await broadcastToAllSubscribedSockets();
//         } catch (error) {
//           console.error("Error in option chain job:", error);
//         }
//       },
//       {
//         scheduled: true,
//         timezone: "Asia/Kolkata",
//       }
//     );

//     console.log("Option chain job started");
//   }

//   stop() {
//     if (this.task) {
//       this.task.stop();
//       this.task = null;
//       console.log("Option chain job stopped");
//     }
//   }
// }

// export default new OptionChainJob();

import cron from "node-cron";
import {
  broadcastChainOptionInsider,
  emitChainUpdate,
} from "../config/chainSocket.js";
import { fetchAndSaveAllUnderlyings } from "../services/optionChain.service.js";
import { getSocketInstance } from "../config/socket.js";

class OptionChainJob {
  constructor() {
    this.task = null;
    this.flag = false;
  }

  setFlag() {
    this.flag = true;
  }

  async safeEmitOptionChainUpdate({ index, expiry }) {
    try {
      const io = getSocketInstance();
      io.emit("optionChainDataUpdated", {
        updated: true,
        timestamp: new Date().toISOString(),
        source: "chain-job",
      });

      await broadcastChainOptionInsider({ index, expiry });

      console.log("✅ Chain broadcast sent");
    } catch (error) {
      console.warn("⚠️ Chain socket broadcast failed:", error.message);
    }
  }

  start() {
    if (this.task) {
      console.log("Option chain job already running");
      return;
    }
    //  "*/3 9-15 * * 1-5"
    this.task = cron.schedule(
      "*/3 9-15 * * 1-5",
      async () => {
        try {
          console.log("🚀 Running option chain data fetch...");
          await fetchAndSaveAllUnderlyings(this.flag);
          // await this.safeEmitOptionChainUpdate();
        } catch (error) {
          console.error("❌ Error in option chain job:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );

    console.log(
      "✅ Option chain job started (every 3 mins, 9:15-3:00 IST Mon-Fri)"
    );
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log("⏹️ Option chain job stopped");
    }
  }
}

export default new OptionChainJob();
