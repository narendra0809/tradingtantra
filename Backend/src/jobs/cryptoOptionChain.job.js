import cron from "node-cron";
import { fetchAndSaveAllCrypto } from "../services/cryptoOptionChain.service.js";
import { broadcastChainCryptoOptionInsider } from "../config/chainSocket.js";
import {
  BtcOptionChain,
  EthOptionChain,
} from "../models/cryptoOptionChain.model.js";

class CryptoOptionChainJob {
  constructor() {
    this.fetchTask = null;
    this.cleanupTask = null;
  }

  start() {
    if (this.fetchTask) {
      console.log("Crypto option chain job already running");
      return;
    }

    // Crypto markets are 24/7 — run every 3 minutes, all day, every day
    this.fetchTask = cron.schedule(
      "*/3 * * * *",
      async () => {
        try {
          console.log("🚀 Running crypto option chain data fetch...");
          await fetchAndSaveAllCrypto();
          try {
            await broadcastChainCryptoOptionInsider();
          } catch (err) {
            console.error("⚠️ Failed to broadcast crypto option insider:", err.message);
          }
        } catch (error) {
          console.error("❌ Error in crypto option chain job:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );

    // Cleanup old data every 24 hours at midnight IST
    this.cleanupTask = cron.schedule(
      "0 0 * * *",
      async () => {
        try {
          const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
          console.log(`🧹 Cleaning crypto option chain data older than ${cutoff.toISOString()}...`);

          const btcResult = await BtcOptionChain.deleteMany({ updatedAt: { $lt: cutoff } });
          const ethResult = await EthOptionChain.deleteMany({ updatedAt: { $lt: cutoff } });

          console.log(`✅ Cleanup done — Deleted BTC: ${btcResult.deletedCount}, ETH: ${ethResult.deletedCount} records`);
        } catch (error) {
          console.error("❌ Error in crypto cleanup job:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );

    console.log(
      "✅ Crypto option chain job started (fetch: every 3 mins, cleanup: daily at midnight IST)"
    );
  }

  stop() {
    if (this.fetchTask) {
      this.fetchTask.stop();
      this.fetchTask = null;
    }
    if (this.cleanupTask) {
      this.cleanupTask.stop();
      this.cleanupTask = null;
    }
    console.log("⏹️ Crypto option chain jobs stopped");
  }
}

export default new CryptoOptionChainJob();
