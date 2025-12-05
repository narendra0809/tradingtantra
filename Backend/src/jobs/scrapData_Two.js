import axios from "axios";
import * as cheerio from "cheerio";
import FiiDiiData from "../models/FiiDiiData.model.js";

const GROWW_URL = "https://groww.in/fii-dii-data";
const MONEYCONTROL_URL =
  "https://www.moneycontrol.com/stocks/marketstats/fii_dii_activity/index.php";

// Common helper: clean number string -> "12345.67"
const cleanNumber = (str) => {
  if (!str) return null;
  return str.replace(/[,₹\s]/g, "").trim(); // remove comma, ₹, spaces
};
// "DD-MM-YYYY" -> check if same as current month & year
const isCurrentMonth = (dateStr) => {
  const [dd, mm, yyyy] = dateStr.split("-");
  const now = new Date();

  const curMonth = String(now.getMonth() + 1).padStart(2, "0");
  const curYear = String(now.getFullYear());

  return mm === curMonth && yyyy === curYear;
};

// Parse "12 Jun 2025" -> "12-06-2025"
const formatDateFromGroww = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.trim().split(" ");
  const monthMap = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  if (!monthMap[month]) return null;
  return `${day.padStart(2, "0")}-${monthMap[month]}-${year}`;
};

// Parse "05-Dec-2025" -> "05-12-2025"
// Text like "05-Dec-2025 05-Dec-2025" -> "05-12-2025"
const formatDateFromMoneycontrol = (raw) => {
  if (!raw) return null;

  // First occurrence of pattern DD-MMM-YYYY
  const m = raw.match(/(\d{2})-([A-Za-z]{3})-(\d{4})/);
  if (!m) return null;

  const [, day, monthAbbr, year] = m;

  const monthMap = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const month = monthMap[monthAbbr];
  if (!month) return null;

  return `${day}-${month}-${year}`; // DD-MM-YYYY
};


// Date string "DD-MM-YYYY" -> Date object (for sorting)
const parseDdMmYyyyToDate = (dateStr) => {
  const [d, m, y] = dateStr.split("-");
  return new Date(`${y}-${m}-${d}T00:00:00`);
};

/**
 * Scrape data from Groww
 * Expected table: table.tb10Table.borderPrimary
 */
async function scrapeFromGroww() {
  try {
    const response = await axios.get(GROWW_URL, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const data = [];

    $("table.tb10Table.borderPrimary tbody tr").each((index, element) => {
      const row = $(element)
        .find("td")
        .map((i, td) => $(td).text().trim().replace(/\s+/g, " "))
        .get();

      // Row format: [Date, FII Buy, FII Sell, FII Net, DII Buy, DII Sell, DII Net]
      if (row.length === 7) {
        const date = formatDateFromGroww(row[0]);
        if (!date) return;

        const entry = {
          date,
          fii_buy: cleanNumber(row[1]),
          fii_sell: cleanNumber(row[2]),
          fii_net: cleanNumber(row[3]),
          dii_buy: cleanNumber(row[4]),
          dii_sell: cleanNumber(row[5]),
          dii_net: cleanNumber(row[6]),
          source: "groww",
        };

        data.push(entry);
      }
    });

    console.log(`Groww: scraped ${data.length} rows`);
    return data;
  } catch (error) {
    console.error("Error scraping Groww:", error.message);
    return [];
  }
}

/**
 * Scrape data from Moneycontrol (Cash column)
 * Table: inside .fidi_tbescrol table.mctable1.tble1
 */
async function scrapeFromMoneycontrol() {
  try {
    const response = await axios.get(MONEYCONTROL_URL, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer:
          "https://www.moneycontrol.com/stocks/marketstats/fii_dii_activity/index.php",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const data = [];

    // Sirf daily cash table ke tbody rows
    $(".fidi_tbescrol table.mctable1.tble1 tbody tr").each((index, rowEl) => {
      const tds = $(rowEl).find("td");
      if (tds.length < 7) return;

      const rawDate = $(tds[0]).text().trim().replace(/\s+/g, " ");
      const date = formatDateFromMoneycontrol(rawDate);
      if (!date) return;

      // 👉 Sirf current month ka data rakho
      if (!isCurrentMonth(date)) return;

      const values = [];
      tds.each((i, td) => {
        values.push($(td).text().trim().replace(/\s+/g, " "));
      });

      const entry = {
        date,
        fii_buy: cleanNumber(values[1]),
        fii_sell: cleanNumber(values[2]),
        fii_net: cleanNumber(values[3]),
        dii_buy: cleanNumber(values[4]),
        dii_sell: cleanNumber(values[5]),
        dii_net: cleanNumber(values[6]),
        source: "moneycontrol",
      };

      data.push(entry);
    });

    

    return data;
  } catch (error) {
    console.error("Error scraping Moneycontrol:", error.message);
    return [];
  }
}




async function scrapeAndSaveFIIDIIData() {
  try {
    // 1) Pehle Groww se data lao
    const growwData = await scrapeFromGroww();

    // 2) Fir Moneycontrol se data lao (fallback / extra dates ke liye)
    const moneyData = await scrapeFromMoneycontrol();

    // 3) Date-wise merge with priority:
    //    - Pehle Groww entries add karo
    //    - Phir Moneycontrol se sirf wahi date add karo jo pehle se map me nahi hai
    const dataByDate = new Map();

    const addEntries = (entries, sourceName) => {
      for (const entry of entries) {
        if (!entry.date) continue;

        // Validate numbers
        const fields = [
          "fii_buy",
          "fii_sell",
          "fii_net",
          "dii_buy",
          "dii_sell",
          "dii_net",
        ];
        let invalid = false;
        for (const f of fields) {
          if (!entry[f] || isNaN(parseFloat(entry[f]))) {
            console.warn(
              `Skipping ${sourceName} entry for ${entry.date} because ${f} is invalid:`,
              entry[f]
            );
            invalid = true;
            break;
          }
        }
        if (invalid) continue;

        // Groww ko priority hai: agar date already map me hai to override mat karo
        if (!dataByDate.has(entry.date)) {
          dataByDate.set(entry.date, entry);
        }
      }
    };

    addEntries(growwData, "groww");
    addEntries(moneyData, "moneycontrol");

    if (dataByDate.size === 0) {
      console.warn(
        "No valid data scraped from either Groww or Moneycontrol. Check if pages changed."
      );
      return [];
    }

    // 4) Date ke hisaab se sort (oldest -> newest)
    const allEntries = Array.from(dataByDate.values()).sort((a, b) => {
      return parseDdMmYyyyToDate(a.date) - parseDdMmYyyyToDate(b.date);
    });

    // 5) DB me save karo (sirf new dates)
    for (const entry of allEntries) {
      const existing = await FiiDiiData.findOne({ date: entry.date });

      if (!existing) {
        await FiiDiiData.create({
          date: entry.date,
          fii_buy: entry.fii_buy,
          fii_sell: entry.fii_sell,
          fii_net: entry.fii_net,
          dii_buy: entry.dii_buy,
          dii_sell: entry.dii_sell,
          dii_net: entry.dii_net,
        });
        console.log(
          `Saved ${entry.date} from ${entry.source === "groww" ? "Groww" : "Moneycontrol"}`
        );
      } else {
        console.log(`Skipped (already exists): ${entry.date}`);
      }
    }

    console.log(
      `Scraping and saving complete. Total merged rows: ${allEntries.length}`
    );

    // Compatibility: first entry return kar raha hoon
    return allEntries[0];
  } catch (error) {
    console.error("Error in scrapeAndSaveFIIDIIData:", error.message);
    return [];
  }
}

export default scrapeAndSaveFIIDIIData;
