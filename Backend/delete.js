// 1. Required modules
import { MongoClient } from 'mongodb';
import cron from 'node-cron';
import dotenv from 'dotenv';

// 2. Load .env config (e.g. DB_URI)
dotenv.config();

const uri = process.env.DB_URI; // Your MongoDB connection string
const client = new MongoClient(uri);

// 3. Check if today is a working day (1st to 5th, Mon–Fri, not a holiday)
async function isMarketWorkingDay() {
  const today = new Date();
  const date = today.getDate(); // 1–31
  const day = today.getDay();   // 0 = Sunday, 6 = Saturday

  // Not between 1st–5th OR it's Sat/Sun → market closed
  if (date < 1 || date > 5 || day === 0 || day === 6) return false;

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    await client.connect();
    const db = client.db();
    const holidays = db.collection('marketholidays');

    const holiday = await holidays.findOne({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // Agar holiday mila to false return karenge (market closed)
    return !holiday;
  } catch (err) {
    console.error('🛑 Error checking holiday:', err);
    return false;
  } finally {
    await client.close();
  }
}

// 4. Remove duplicate entries in `data` array and keep only latest one
async function keepOnlyLatestMarketData() {
  const localClient = new MongoClient(uri);
  let duplicateDataCleaned = 0;
  let oldDocumentsDeleted = 0;

  try {
    await localClient.connect();
    const db = localClient.db();
    const collection = db.collection('marketdetaildatas');

    const documents = await collection.find({}).toArray();
    const bulkOps = [];

    for (const doc of documents) {
      if (!doc.data || !Array.isArray(doc.data) || doc.data.length === 0) continue;

      // Get the latest entry from data array
      const latestEntry = doc.data.reduce((latest, curr) =>
        curr.lastTradeTime > latest.lastTradeTime ? curr : latest
      );

      // Agar ek se zyada entry hai, to clean karo
      if (doc.data.length > 1) {
        duplicateDataCleaned++;
        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: { data: [latestEntry] },
              $currentDate: { updatedAt: true }
            }
          }
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

      const toDelete = await collection.find({})
        .sort({ updatedAt: 1 })
        .limit(excess)
        .project({ _id: 1 })
        .toArray();

      const ids = toDelete.map(doc => doc._id);
      await collection.deleteMany({ _id: { $in: ids } });

      oldDocumentsDeleted = ids.length;
      console.log(`🧹 Deleted ${oldDocumentsDeleted} old documents`);
    }

    console.log(`✅ keepOnlyLatestMarketData finished`);
    console.log(`📌 Duplicate entries cleaned: ${duplicateDataCleaned}`);
    console.log(`📌 Old documents deleted due to limit: ${oldDocumentsDeleted}`);

  } catch (err) {
    console.error('🛑 Error in keepOnlyLatestMarketData:', err);
  } finally {
    await localClient.close();
  }
}

// 5. Schedule CRON Job to run every 2 mins between 9:15 AM and 3:32 PM (Mon–Fri)
const runMarketCleanupJob = async () => {
  const now = new Date();
  const hr = now.getHours();
  const min = now.getMinutes();
  const totalMinutes = hr * 60 + min;

  // ✅ Only run between 9:15 AM (555 mins) and 6:00 PM (1080 mins)
  if (totalMinutes < 555 || totalMinutes > 1080) {
    console.log(`[${now.toLocaleTimeString()}] ⏳ Outside market time`);
    return;
  }

  const shouldRun = await isMarketWorkingDay();

  if (shouldRun) {
    console.log(`[${now.toLocaleTimeString()}] ✅ Market Open - Running job`);
    await keepOnlyLatestMarketData();
  } else {
    console.log(`[${now.toLocaleTimeString()}] 🚫 Market closed or holiday`);
  }
};

// ✅ Scheduled job every minute between 9 AM to 6 PM, Monday to Friday
cron.schedule('* 9-18 * * 1-5', runMarketCleanupJob);

// ✅ Run manually when script starts (optional)
runMarketCleanupJob();
