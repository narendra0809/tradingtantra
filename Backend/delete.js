import { MongoClient } from 'mongodb';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DB_URI; // From .env
const client = new MongoClient(uri);

// ✅ Check if today is a working day (1st–5th and not weekend/holiday)
async function isMarketWorkingDay() {
  const today = new Date();
  const date = today.getDate();
  const day = today.getDay(); // 0 = Sunday, 6 = Saturday

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

    return !holiday;
  } catch (err) {
    console.error('🛑 Error checking holiday:', err);
    return false;
  } finally {
    await client.close();
  }
}


async function keepOnlyLatestMarketData() {
  const localClient = new MongoClient(uri);

  try {
    await localClient.connect();
    const db = localClient.db();
    const collection = db.collection('marketdetaildatas');

    const documents = await collection.find({}).toArray();
    const bulkOps = [];

    for (const doc of documents) {
      if (!doc.data || !Array.isArray(doc.data) || doc.data.length === 0) continue;

      const latestEntry = doc.data.reduce((latest, curr) =>
        curr.lastTradeTime > latest.lastTradeTime ? curr : latest
      );

      if (doc.data.length > 1) {
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

    // Delete older docs if exceeding limit
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

      console.log(`🧹 Deleted ${excess} old docs`);
    }

    console.log('✅ keepOnlyLatestMarketData finished');
  } catch (err) {
    console.error('🛑 Error in keepOnlyLatestMarketData:', err);
  } finally {
    await localClient.close();
  }
}

// ⏰ CRON Job: Every 2 mins between 9:15 AM and 3:32 PM on working days
cron.schedule('*/2 9-15 * * *', async () => {
  const now = new Date();
  const hr = now.getHours();
  const min = now.getMinutes();

  if ((hr === 9 && min < 15) || (hr === 15 && min > 32)) return;

  const shouldRun = await isMarketWorkingDay();
  if (shouldRun) {
    console.log(`[${now.toLocaleTimeString()}] 🔁 Running job`);
    await keepOnlyLatestMarketData();
  } else {
    console.log(`[${now.toLocaleTimeString()}] 🚫 Market closed or holiday`);
  }
});
