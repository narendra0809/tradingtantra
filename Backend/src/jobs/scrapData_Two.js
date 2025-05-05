import axios from "axios";
import * as cheerio from "cheerio";
import FiiDiiData from "../models/FiiDiiData.model.js";

async function scrapeAndSaveFIIDIIData() {
  try {
    const url = "https://upstox.com/fii-dii-data/";
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    console.log("Response URL:", response.request.res.responseUrl);
    const html = response.data;
    const $ = cheerio.load(html);
    const data = [];

    // Target the table within the table-wrapper div
    $("div.table-wrapper table tbody tr").each((index, element) => {
      const row = $(element)
        .find("td")
        .map((i, td) => $(td).text().trim().replace(/\s+/g, " "))
        .get();

      // Ensure the row has the expected number of columns (7)
      if (row.length === 7 && /^\d{2}-\d{2}-\d{4}$/.test(row[0])) {
        // Clean numerical values: remove ₹, commas, and handle negative values
        const cleanNumber = (str) => {
          return str.replace(/[₹,]/g, "").trim();
        };

        data.push({
          date: row[0], // e.g., "25-04-2025"
          fii_buy: cleanNumber(row[1]), // e.g., "15524.03"
          fii_sell: cleanNumber(row[2]),
          fii_net: cleanNumber(row[3]),
          dii_buy: cleanNumber(row[4]),
          dii_sell: cleanNumber(row[5]),
          dii_net: cleanNumber(row[6]),
        });
      }
    });

    if (data.length === 0) {
      console.warn("No valid data scraped from the website. Check if the page requires login or JavaScript.");
      return []; // Return empty array to avoid breaking the scheduler
    }

    for (const entry of data) {
      // Validate numerical fields
      const numericalFields = ["fii_buy", "fii_sell", "fii_net", "dii_buy", "dii_sell", "dii_net"];
      for (const field of numericalFields) {
        if (!entry[field] || isNaN(parseFloat(entry[field]))) {
          throw new Error(`Invalid ${field} for date ${entry.date}`);
        }
      }

      const existing = await FiiDiiData.findOne({ date: entry.date });

      if (!existing) {
        await FiiDiiData.create(entry);
        console.log(`Saved: ${entry.date}`);
      } else {
        console.log(`Skipped (already exists): ${entry.date}`);
      }
    }

    console.log(`Scraping and saving complete. Scraped ${data.length} rows.`);
    return data[0]; // Return the first valid entry for compatibility

  } catch (error) {
    console.error("Error scraping or saving data:", error.message);
    return []; // Return empty array on error to avoid breaking the scheduler
  }
}

export default scrapeAndSaveFIIDIIData;