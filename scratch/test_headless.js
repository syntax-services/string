import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    console.log("Navigating to google.com...");
    await page.goto("https://google.com", { timeout: 10000 });
    console.log("Navigation successful!");
    await page.screenshot({ path: "C:/Users/Administrator/.gemini/antigravity/brain/593bfdb9-72f6-4830-a14d-5eff4c71a89f/scratch/google.png" });
  } catch (e) {
    console.error("Navigation failed:", e.message);
  } finally {
    await browser.close();
  }
})();
