import axios from "axios";
import * as cheerio from "cheerio";
import FiiDiiData from "../models/FiiDiiData.model.js";

const GROWW_URL = "https://groww.in/fii-dii-data";
const MONEYCONTROL_URL =
  "https://www.moneycontrol.com/stocks/marketstats/fii_dii_activity/index.php";

/* -------------------- HELPERS -------------------- */

// Clean number string → "12345.67"
const cleanNumber = (str) => {
  if (!str) return null;
  return str.replace(/[,₹\s]/g, "").trim();
};

// "12 Jun 2025" → "12-06-2025"
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

// "05-Dec-2025 05-Dec-2025" → "05-12-2025"
const formatDateFromMoneycontrol = (raw) => {
  if (!raw) return null;

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

  if (!monthMap[monthAbbr]) return null;
  return `${day}-${monthMap[monthAbbr]}-${year}`;
};

// "DD-MM-YYYY" → Date object
const parseDdMmYyyyToDate = (dateStr) => {
  const [d, m, y] = dateStr.split("-");
  return new Date(`${y}-${m}-${d}T00:00:00`);
};

/* -------------------- GROWW SCRAPER -------------------- */

async function scrapeFromGroww() {
  try {
    const response = await axios.get(GROWW_URL, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const data = [];

    $("table.tb10Table.borderPrimary tbody tr").each((_, el) => {
      const row = $(el)
        .find("td")
        .map((i, td) => $(td).text().trim().replace(/\s+/g, " "))
        .get();

      if (row.length === 7) {
        const date = formatDateFromGroww(row[0]);
        if (!date) return;

        data.push({
          date,
          fii_buy: cleanNumber(row[1]),
          fii_sell: cleanNumber(row[2]),
          fii_net: cleanNumber(row[3]),
          dii_buy: cleanNumber(row[4]),
          dii_sell: cleanNumber(row[5]),
          dii_net: cleanNumber(row[6]),
          source: "groww",
        });
      }
    });

    console.log(`✅ Groww scraped: ${data.length} rows`);
    return data;
  } catch (err) {
    console.error("❌ Groww scrape error:", err.message);
    return [];
  }
}

/* -------------------- MONEYCONTROL SCRAPER -------------------- */

async function scrapeFromMoneycontrol() {
  try {
    const response = await axios.get(MONEYCONTROL_URL, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: MONEYCONTROL_URL,
      },
    });

    const $ = cheerio.load(response.data);
    const data = [];

    $(".fidi_tbescrol table.mctable1.tble1 tbody tr").each((_, row) => {
      const tds = $(row).find("td");
      if (tds.length < 7) return;

      const rawDate = $(tds[0]).text().trim();
      const date = formatDateFromMoneycontrol(rawDate);
      if (!date) return;

      const values = [];
      tds.each((_, td) =>
        values.push($(td).text().trim().replace(/\s+/g, " "))
      );

      data.push({
        date,
        fii_buy: cleanNumber(values[1]),
        fii_sell: cleanNumber(values[2]),
        fii_net: cleanNumber(values[3]),
        dii_buy: cleanNumber(values[4]),
        dii_sell: cleanNumber(values[5]),
        dii_net: cleanNumber(values[6]),
        source: "moneycontrol",
      });
    });

    console.log(`✅ Moneycontrol scraped: ${data.length} rows`);
    return data;
  } catch (err) {
    console.error("❌ Moneycontrol scrape error:", err.message);
    return [];
  }
}

/* -------------------- MAIN MERGE & SAVE -------------------- */

async function scrapeAndSaveFIIDIIData() {
  try {
    const growwData = await scrapeFromGroww();
    const moneyData = await scrapeFromMoneycontrol();

    const dataByDate = new Map();

    const addEntries = (entries, source) => {
      for (const entry of entries) {
        if (!entry.date) continue;

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
            invalid = true;
            break;
          }
        }
        if (invalid) continue;

        if (!dataByDate.has(entry.date)) {
          dataByDate.set(entry.date, entry);
          console.log(`➕ Added ${entry.date} from ${source}`);
        }
      }
    };

    // Groww priority
    addEntries(growwData, "groww");
    addEntries(moneyData, "moneycontrol");

    if (dataByDate.size === 0) {
      console.warn("⚠️ No valid FI/DII data found");
      return [];
    }

    const finalData = Array.from(dataByDate.values()).sort(
      (a, b) => parseDdMmYyyyToDate(a.date) - parseDdMmYyyyToDate(b.date)
    );

    for (const entry of finalData) {
      const exists = await FiiDiiData.findOne({ date: entry.date });
      if (!exists) {
        await FiiDiiData.create(entry);
        console.log(`💾 Saved ${entry.date}`);
      }
    }

    console.log(`🎯 Total merged rows: ${finalData.length}`);
    return finalData;
  } catch (err) {
    console.error("❌ scrapeAndSaveFIIDIIData error:", err.message);
    return [];
  }
}

export default scrapeAndSaveFIIDIIData;
