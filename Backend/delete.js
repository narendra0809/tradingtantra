import { MongoClient } from 'mongodb';

async function keepOnlyLatestMarketData() {
  const uri = "mongodb://localhost:27017/";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("tradingtantra");
    const collection = database.collection("marketdetaildatas");

    const documents = await collection.find({}).toArray();
    const bulkOps = [];
    let totalDocumentsProcessed = 0;
    let totalDocumentsModified = 0;

    for (const doc of documents) {
      if (!doc.data || !Array.isArray(doc.data) || doc.data.length === 0) {
        continue;
      }

      totalDocumentsProcessed++;

      // Keep only the latest entry by lastTradeTime
      const latestEntry = doc.data.reduce((latest, current) =>
        current.lastTradeTime > latest.lastTradeTime ? current : latest
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
        totalDocumentsModified++;
      }

      // Execute in batches of 100
      if (bulkOps.length >= 100) {
        await collection.bulkWrite(bulkOps);
        bulkOps.length = 0;
        console.log(`Processed ${totalDocumentsProcessed} documents, modified ${totalDocumentsModified}`);
      }
    }

    // Final batch write
    if (bulkOps.length > 0) {
      const result = await collection.bulkWrite(bulkOps);
      console.log(`Final batch: Modified ${result.modifiedCount} documents`);
    }

    // 👇 Enforce only latest 4320 documents
    const totalCount = await collection.countDocuments();
    const MAX_DOCS = 4320;

    if (totalCount > MAX_DOCS) {
      const docsToDelete = totalCount - MAX_DOCS;
      const oldestDocs = await collection.find({})
        .sort({ updatedAt: 1 })  // Sort by oldest updatedAt
        .limit(docsToDelete)
        .project({ _id: 1 })
        .toArray();

      const idsToDelete = oldestDocs.map(doc => doc._id);
      const deleteResult = await collection.deleteMany({ _id: { $in: idsToDelete } });

      console.log(`Deleted ${deleteResult.deletedCount} oldest documents to maintain max ${MAX_DOCS}`);
    }

    console.log(`Process completed!`);
    console.log(`Total documents processed: ${totalDocumentsProcessed}`);
    console.log(`Total documents modified: ${totalDocumentsModified}`);

  } catch (error) {
    console.error("Error during processing:", error);
  } finally {
    await client.close();
  }
}

// Run every 2 minutes (adjust as needed)
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Running keepOnlyLatestMarketData`);
  keepOnlyLatestMarketData();
}, 10 * 1000);
