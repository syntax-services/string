const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const shopperEmail = 'string_customer_live@string.demo';
const shopperPassword = 'StringProdPass123!';
const merchantEmail = 'string_merchant_live@string.demo';
const merchantPassword = 'StringProdPass123!';

const screenshotsDir = path.join(__dirname, 'screenshots_live');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log("=== STARTING LIVE END-TO-END SUITE ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Capture logs
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  try {
    // ============================================
    // FLOW A: CUSTOMER LOGIN
    // ============================================
    console.log("\n--- FLOW A: CUSTOMER LOGIN ---");
    console.log("Navigating to login page...");
    await page.goto('http://localhost:8080/auth?mode=login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '01_login_page.png') });

    console.log("Typing customer credentials...");
    await page.type('input[id="email"]', shopperEmail);
    await page.type('input[id="password"]', shopperPassword);
    await page.screenshot({ path: path.join(screenshotsDir, '02_login_filled.png') });

    console.log("Submitting login form...");
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
    ]);

    console.log(`Current URL after login: ${page.url()}`);
    await page.screenshot({ path: path.join(screenshotsDir, '03_after_login.png') });

    // Handle onboarding if redirected there
    if (page.url().includes('/onboarding')) {
      console.log("Customer Onboarding is visible. Filling form...");
      
      // Select customer role
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const shopperBtn = btns.find(b => b.textContent.includes('Shopper') || b.textContent.includes('Customer'));
        if (shopperBtn) shopperBtn.click();
      });
      await delay(1000);

      // Name & Handle
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Name'));
        if (nameInput) {
          nameInput.value = 'John Customer Live';
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const handleInput = inputs.find(i => i.placeholder && i.placeholder.includes('handle'));
        if (handleInput) {
          handleInput.value = 'john_cust_live';
          handleInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      // Submit
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Get Started'));
        if (nextBtn) nextBtn.click();
      });
      await delay(4000);
      console.log(`URL after customer onboarding: ${page.url()}`);
      await page.screenshot({ path: path.join(screenshotsDir, '04_customer_dashboard.png') });
    }

    // Nav to discover
    console.log("Navigating to Discover page...");
    await page.goto('http://localhost:8080/customer/discover', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '05_discover_page.png') });

    // Find any business card or item to click
    console.log("Checking for items on Discover page...");
    const itemsExist = await page.evaluate(() => {
      const cards = document.querySelectorAll('.dashboard-card, [class*="card"]');
      return cards.length > 0;
    });

    console.log(`Items/Stores found on discover page: ${itemsExist}`);

    if (itemsExist) {
      console.log("Clicking on the first discover item card to open details...");
      await page.evaluate(() => {
        const card = document.querySelector('.dashboard-card, [class*="card"]');
        if (card) card.click();
      });
      await delay(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '06_discover_item_modal.png') });

      // Click "Inquire in Store" or click Store link in modal to go to Business Public Profile
      console.log("Clicking to visit the store profile...");
      const navToStoreSuccess = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, span'));
        const storeBtn = buttons.find(b => b.textContent.includes('Inquire in Store') || b.textContent.includes('Store') || (b.className && b.className.includes('Store')));
        if (storeBtn) {
          storeBtn.click();
          return true;
        }
        return false;
      });

      console.log(`Click action success: ${navToStoreSuccess}`);
      await delay(3000);
      console.log(`Current URL after visiting store: ${page.url()}`);
      await page.screenshot({ path: path.join(screenshotsDir, '07_store_public_profile.png') });

      // Click Message button
      console.log("Clicking the Message button on the store profile...");
      const clickedMsg = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const msgBtn = btns.find(b => b.textContent.includes('Message'));
        if (msgBtn) {
          msgBtn.click();
          return true;
        }
        return false;
      });

      console.log(`Clicked Message button: ${clickedMsg}`);
      await delay(4000);
      console.log(`Current URL after Message click: ${page.url()}`);
      await page.screenshot({ path: path.join(screenshotsDir, '08_chat_inbox.png') });

      // Send a chat message!
      console.log("Typing message in chat...");
      await page.evaluate(() => {
        const input = document.querySelector('input[placeholder="Type a message..."]');
        if (input) {
          input.value = "Hello from Antigravity E2E Live Test! Let's build something great.";
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      await page.screenshot({ path: path.join(screenshotsDir, '09_chat_message_typed.png') });

      console.log("Clicking Send button...");
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
        } else {
          const sendBtn = document.querySelector('button[type="submit"]');
          if (sendBtn) sendBtn.click();
        }
      });
      await delay(3000);
      await page.screenshot({ path: path.join(screenshotsDir, '10_chat_message_sent.png') });
    } else {
      console.log("No listings found on Discover page to message. Continuing...");
    }

    // Logout
    console.log("Logging out of customer account...");
    await page.evaluate(() => localStorage.clear());
    await delay(1000);

    // ============================================
    // FLOW B: MERCHANT LOGIN
    // ============================================
    console.log("\n--- FLOW B: MERCHANT LOGIN ---");
    console.log("Navigating to login page for merchant...");
    await page.goto('http://localhost:8080/auth?mode=login', { waitUntil: 'networkidle2' });
    await page.type('input[id="email"]', merchantEmail);
    await page.type('input[id="password"]', merchantPassword);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
    ]);

    console.log(`Current URL after merchant login: ${page.url()}`);
    await page.screenshot({ path: path.join(screenshotsDir, '11_merchant_after_login.png') });

    // Handle merchant onboarding
    if (page.url().includes('/onboarding')) {
      console.log("Merchant Onboarding is visible. Completing onboarding...");
      
      // Select Merchant role
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const merchantBtn = btns.find(b => b.textContent.includes('Merchant') || b.textContent.includes('Business'));
        if (merchantBtn) merchantBtn.click();
      });
      await delay(1000);

      // Name & Handle
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Name'));
        if (nameInput) {
          nameInput.value = 'Mary Merchant Live';
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const handleInput = inputs.find(i => i.placeholder && i.placeholder.includes('handle'));
        if (handleInput) {
          handleInput.value = 'mary_merchant_live';
          handleInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      // Submit step 1
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Continue'));
        if (nextBtn) nextBtn.click();
      });
      await delay(2000);

      // Store Details (step 2)
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        const compName = inputs.find(i => i.id === 'companyName');
        if (compName) {
          compName.value = 'Mary Premium Kitchen';
          compName.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const locationInput = inputs.find(i => i.id === 'location');
        if (locationInput) {
          locationInput.value = 'Lagos, Nigeria';
          locationInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const descInput = inputs.find(i => i.id === 'productsServices');
        if (descInput) {
          descInput.value = 'Homemade gourmet burgers and premium breakfast meals.';
          descInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      await page.screenshot({ path: path.join(screenshotsDir, '12_merchant_store_filled.png') });

      // Select business type: both
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const bothBtn = buttons.find(b => b.textContent.includes('Both'));
        if (bothBtn) bothBtn.click();
      });
      await delay(1000);

      // Finish Onboarding
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const finishBtn = btns.find(b => b.textContent.includes('Finish') || b.textContent.includes('Submit') || b.textContent.includes('Dashboard'));
        if (finishBtn) finishBtn.click();
      });
      await delay(4000);
      console.log(`Current URL after merchant onboarding finish: ${page.url()}`);
      await page.screenshot({ path: path.join(screenshotsDir, '13_merchant_dashboard.png') });
    }

    // Go to upload page
    console.log("Navigating to Business Upload Catalog page...");
    await page.goto('http://localhost:8080/business/upload', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '14_upload_page.png') });

    // Upload product
    console.log("Uploading product listing...");
    await page.evaluate(() => {
      document.querySelector('input[id="product-name"]').value = 'Gourmet Classic Burger';
      document.querySelector('input[id="product-name"]').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('textarea[id="product-desc"]').value = 'Thick and juicy hand-pressed beef burger topped with fresh cheddar cheese, organic lettuce, and Mary secret sauce.';
      document.querySelector('textarea[id="product-desc"]').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('input[id="product-price"]').value = '4500';
      document.querySelector('input[id="product-price"]').dispatchEvent(new Event('input', { bubbles: true }));
    });

    console.log("Attaching product image...");
    const productImgInput = await page.$('input[id="product-image"]');
    await productImgInput.uploadFile(path.join(process.cwd(), 'burger.png'));
    await delay(3000); // Wait for canvas optimization and upload
    await page.screenshot({ path: path.join(screenshotsDir, '15_product_form_filled.png') });

    console.log("Submitting product catalog item...");
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    });
    await delay(5000);
    await page.screenshot({ path: path.join(screenshotsDir, '16_product_upload_completed.png') });

    // Switch to Service tab
    console.log("Switching to Service tab...");
    await page.evaluate(() => {
      const triggers = Array.from(document.querySelectorAll('[role="tab"]'));
      const serviceTab = triggers.find(t => t.textContent.includes('Service'));
      if (serviceTab) serviceTab.click();
    });
    await delay(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '17_service_tab_open.png') });

    // Fill Service details
    console.log("Filling service details...");
    await page.evaluate(() => {
      document.querySelector('input[id="service-name"]').value = 'Chef Private Catering';
      document.querySelector('input[id="service-name"]').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('textarea[id="service-desc"]').value = 'Hire a professional private chef for small home events and custom brunch preparations.';
      document.querySelector('textarea[id="service-desc"]').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('input[placeholder="Add location"]').value = 'Lagos Mainland';
      document.querySelector('input[placeholder="Add location"]').dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Add location click
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent === 'Add');
      if (addBtn) addBtn.click();
    });
    await delay(500);

    console.log("Attaching service images...");
    const serviceImgInput = await page.$('input[id="service-images"]');
    await serviceImgInput.uploadFile(path.join(process.cwd(), 'burger.png'));
    await delay(3000); // Wait for canvas optimization and file upload
    await page.screenshot({ path: path.join(screenshotsDir, '18_service_form_filled.png') });

    console.log("Submitting service catalog item...");
    await page.evaluate(() => {
      const activeForm = document.querySelector('form:not([class*="hidden"])') || document.querySelector('form');
      if (activeForm) {
        activeForm.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    });
    await delay(5000);
    await page.screenshot({ path: path.join(screenshotsDir, '19_service_upload_completed.png') });

    console.log("E2E Live Test suite finished successfully!");

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

run();
