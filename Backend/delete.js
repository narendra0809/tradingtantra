// 1. Required modules
import { MongoClient } from "mongodb";
import cron from "node-cron";
import dotenv from "dotenv";
import { DateTime } from "luxon";

// 2. Load .env config (e.g. DB_URI)
dotenv.config();

const uri = process.env.DB_URI; // Your MongoDB connection string
const client = new MongoClient(uri);

// 3. Check if current time is within market hours (9:15 AM to 3:40 PM IST)
export const isMarketTime = () => {
  const now = DateTime.now().setZone("Asia/Kolkata");
  const hour = now.hour;
  const minute = now.minute;

  // Market hours: 9:15 AM to 3:40 PM IST
  if (hour < 9 || (hour === 9 && minute < 15)) {
    return false; // Before 9:15 AM
  }
  if (hour > 15 || (hour === 15 && minute > 40)) {
    return false; // After 3:40 PM
  }
  return true;
};

// 4. Check if today is a working day (1st to 5th, Mon–Fri, not a holiday)
async function isMarketWorkingDay() {
  const today = new Date();
  const date = today.getDate(); // 1–31
  const day = today.getDay(); // 0 = Sunday, 6 = Saturday

  // Not between 1st–5th OR it's Sat/Sun → market closed
  if (day === 0 || day === 6) 
    return false;

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    await client.connect();
    const db = client.db();
    const holidays = db.collection("marketholidays");

    const holiday = await holidays.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // If holiday found, market is closed
    return !holiday;
  } catch (err) {
    console.error("🛑 Error checking holiday:", err);
    return false;
  } finally {
    await client.close();
  }
}

// 5. Remove duplicate entries in `data` array and keep only latest one
async function keepOnlyLatestMarketData() {
  const localClient = new MongoClient(uri);
  let duplicateDataCleaned = 0;
  let oldDocumentsDeleted = 0;

  try {
    await localClient.connect();
    const db = localClient.db();
    const collection = db.collection("marketdetaildatas");

    const documents = await collection.find({}).toArray();
    const bulkOps = [];

    for (const doc of documents) {
      if (!doc.data || !Array.isArray(doc.data) || doc.data.length === 0)
        continue;

      // Get the latest entry from data array
      const latestEntry = doc.data.reduce((latest, curr) =>
        curr.lastTradeTime > latest.lastTradeTime ? curr : latest
      );

      // If more than one entry, clean it
      if (doc.data.length > 1) {
        duplicateDataCleaned++;
        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: { data: [latestEntry] },
              $currentDate: { updatedAt: true },
            },
          },
        });
      }

      if (bulkOps.length >= 100) {
        await collection.bulkWrite(bulkOps);
        bulkOps.length = 0;
      }
    }

    if (bulkOps.length > 0) {
      await collection.bulkWrite(bulkOps);
    }

    // Delete older documents if count exceeds 4320
    const MAX_DOCS = 4320;
    const total = await collection.countDocuments();

    if (total > MAX_DOCS) {
      const excess = total - MAX_DOCS;

      const toDelete = await collection
        .find({})
        .sort({ updatedAt: 1 })
        .limit(excess)
        .project({ _id: 1 })
        .toArray();

      const ids = toDelete.map((doc) => doc._id);
      await collection.deleteMany({ _id: { $in: ids } });

      oldDocumentsDeleted = ids.length;
      console.log(`🧹 Deleted ${oldDocumentsDeleted} old documents`);
    }

    console.log(`✅ keepOnlyLatestMarketData finished`);
    console.log(`📌 Duplicate entries cleaned: ${duplicateDataCleaned}`);
    console.log(
      `📌 Old documents deleted due to limit: ${oldDocumentsDeleted}`
    );
  } catch (err) {
    console.error("🛑 Error in keepOnlyLatestMarketData:", err);
  } finally {
    await localClient.close();
  }
}

// 6. Run market cleanup job
const runMarketCleanupJob = async () => {
  // Check if it's within market hours
  if (!isMarketTime()) {
    console.log("⛔ Outside market hours (9:15 AM–3:40 PM IST), skipping cleanup");
    return;
  }

  // Check if it's a market working day
  const isMarketRunning = await isMarketWorkingDay();
  if (!isMarketRunning) {
    console.log("⛔ Market closed (weekend, holiday, or not 1–5), skipping cleanup");
    return;
  }

  // Run cleanup
  console.log("✅ Running market cleanup job");
  await keepOnlyLatestMarketData();
};

process.env.TZ = "Asia/Kolkata";

cron.schedule("15-59 9 * * 1-5", runMarketCleanupJob); 
cron.schedule("* 10-14 * * 1-5", runMarketCleanupJob); 
cron.schedule("0-40 15 * * 1-5", runMarketCleanupJob); 