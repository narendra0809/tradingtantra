import axios from "axios";
import * as cheerio from "cheerio";
import FiiDiiData from "../models/FiiDiiData.model.js";

async function scrapeAndSaveFIIDIIData() {
  try {
    const url = "https://groww.in/fii-dii-data";
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

    // Target the table with class 'tb10Table borderPrimary'
    $("table.tb10Table.borderPrimary tbody tr").each((index, element) => {
      const row = $(element)
        .find("td")
        .map((i, td) => $(td).text().trim().replace(/\s+/g, " "))
        .get();

      // Ensure the row has the expected number of columns (7: Date, FII Buy, FII Sell, FII Net, DII Buy, DII Sell, DII Net)
      if (row.length === 7) {
        // Clean numerical values: remove commas, ₹, and handle +/-
        const cleanNumber = (str) => {
          return str.replace(/[₹,+]/g, "").replace(/,/g, "").trim();
        };

        // Convert date format from "12 Jun 2025" to "12-Jun-2025"
        const formatDate = (dateStr) => {
          const [day, month, year] = dateStr.split(" ");
          const monthMap = {
            Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
            Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
          };
          return `${day}-${monthMap[month]}-${year}`;
        };

        data.push({
          date: formatDate(row[0]), // e.g., "12-Jun-2025"
          fii_buy: cleanNumber(row[1]), // e.g., "11656.73"
          fii_sell: cleanNumber(row[2]), // e.g., "15488.15"
          fii_net: cleanNumber(row[3]), // e.g., "-3831.42"
          dii_buy: cleanNumber(row[4]), // e.g., "21386.26"
          dii_sell: cleanNumber(row[5]), // e.g., "11992.41"
          dii_net: cleanNumber(row[6]), // e.g., "9393.85"
        });
      }
    });

    if (data.length === 0) {
      console.warn("No valid data scraped from the website. Check if the page requires JavaScript or authentication.");
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