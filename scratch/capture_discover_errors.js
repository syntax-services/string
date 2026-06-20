import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    } else {
      console.log('BROWSER CONSOLE:', msg.text());
    }
  });

  // Capture unhandled page errors
  page.on('pageerror', error => {
    console.log('BROWSER PAGE ERROR:', error.message);
  });

  // Navigate to login page
  await page.goto('http://localhost:8080/login');
  
  // Wait for login form
  await page.waitForSelector('input[type="email"]');
  
  // Login with customer credentials
  await page.type('input[type="email"]', 'habeebtijanivictor@gmail.com');
  await page.type('input[type="password"]', 'Hackerjakewells@123');
  
  // Click login
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  // Navigate to discover
  console.log('Navigating to /discover');
  await page.goto('http://localhost:8080/discover', { waitUntil: 'networkidle0' });
  
  console.log('Waiting 5 seconds...');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Done.');
  await browser.close();
})();
