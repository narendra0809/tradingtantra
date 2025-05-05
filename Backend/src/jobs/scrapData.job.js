import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

chromium.use(StealthPlugin()); // Enable stealth mode

async function scrapeData() {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    bypassCSP: true,
  });

  const page = await context.newPage();

  await page.goto(
    "https://www.moneycontrol.com/stocks/marketstats/fii_dii_activity/index.php",
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );

  await page.waitForTimeout(3000); // Let the page settle

  // Step 1: Close the Notification Popup (if exists)
  const popupSelector = "#wzrk-cancel";
  if (await page.$(popupSelector)) {
    console.log("Closing notification popup...");
    await page.click(popupSelector);
    await page.waitForTimeout(2000);
  } else {
    console.log("No notification popup found.");
  }

  // Step 2: Click the first button: F&O
  const firstButtonSelector = "a[href='#fidifno']";
  if (await page.$(firstButtonSelector)) {
    console.log("Clicking F&O button...");
    await page.click(firstButtonSelector);
    await page.waitForTimeout(3000);
  } else {
    console.log("F&O button not found.");
  }

  // Step 3: Click the second button: Stock
  const secondButtonSelector = "a[href='#fidfn21']";
  if (await page.$(secondButtonSelector)) {
    console.log("Clicking Stock button...");
    await page.click(secondButtonSelector);
    await page.waitForTimeout(5000);
  } else {
    console.log("Stock button not found.");
  }

  // Step 4: Extract Full Page HTML
  const fullPageHTML = await page.evaluate(
    () => document.documentElement.outerHTML
  );

  // Save the extracted page data
  fs.writeFileSync("full_page.html", fullPageHTML, "utf-8");
  console.log("Full page data successfully saved in full_page.html.");

  await browser.close();
}

scrapeData().catch(console.error);
