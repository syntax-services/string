import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';

// Start Vite dev server in background
console.log("Starting dev server...");
const server = spawn('npm', ['run', 'dev'], {
  shell: true,
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  console.log(`[Vite Server]: ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`[Vite Error]: ${data.toString().trim()}`);
});

// Wait for dev server to start
await new Promise(resolve => setTimeout(resolve, 5000));

try {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to see everything clearly
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  console.log("Navigating to auth page...");
  await page.goto('http://localhost:8080/auth?mode=login', { waitUntil: 'networkidle0' });

  console.log("Logging in...");
  await page.type('input[type="email"]', 'habeebtijanivictor@gmail.com');
  await page.type('input[type="password"]', 'Hackerjakewells@123');
  await page.click('button[type="submit"]');

  console.log("Waiting for redirection...");
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  console.log("Navigating to Customer Profile...");
  await page.goto('http://localhost:8080/customer/profile', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check if accordion exists and click it
  console.log("Expanding partnership accordion...");
  const accordionSelector = 'button:has-text("String Merchant Partnership")';
  // We can query the button containing the text "String Merchant Partnership"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const accordion = buttons.find(b => b.textContent.includes('String Merchant Partnership'));
    if (accordion) accordion.click();
  });
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log("Clicking 'Become a String Partner'...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const becomePartnerBtn = buttons.find(b => b.textContent.includes('Become a String Partner'));
    if (becomePartnerBtn) becomePartnerBtn.click();
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log("Taking screenshot before dropdown click...");
  await page.screenshot({ path: 'scratch/modal_before_click.png' });

  console.log("Locating and clicking 'Area' dropdown trigger...");
  // StructuredLocationPicker has 3 dropdowns. The first select trigger usually has the placeholder "Area"
  await page.evaluate(() => {
    const selectTriggers = Array.from(document.querySelectorAll('button[role="combobox"]'));
    const areaTrigger = selectTriggers.find(t => t.textContent.includes('Area') || t.textContent.includes('Lagos Garage') || t.textContent.includes('Loading'));
    if (areaTrigger) {
      console.log("Clicking area trigger...");
      areaTrigger.click();
    } else {
      console.error("Could not find Area select trigger!");
    }
  });

  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log("Taking screenshot of open dropdown options...");
  await page.screenshot({ path: 'scratch/address_dropdown_options.png' });

  // Copy screenshot to artifact directory so Antigravity can view it
  const artifactDest = 'C:/Users/Administrator/.gemini/antigravity/brain/c2afde4d-d121-479c-a3fe-ade6a7891f4e/scratch/address_dropdown_options.png';
  fs.copyFileSync('scratch/address_dropdown_options.png', artifactDest);
  console.log("Screenshot copied to artifacts directory.");

  await browser.close();
} catch (err) {
  console.error("Verification failed:", err);
} finally {
  console.log("Stopping dev server...");
  server.kill();
  process.exit(0);
}
