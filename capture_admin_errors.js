const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  try {
    await page.goto('http://localhost:8080/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
  } catch (e) {
    console.error('Navigation error:', e);
  }
  console.log('Captured console errors:');
  console.log(errors.join('\n'));
  await browser.close();
})();
