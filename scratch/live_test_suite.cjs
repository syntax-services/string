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

async function handleTermsModal(page) {
  const modalButtonText = 'I Accept & Continue';
  console.log("Checking for Terms of Service Update modal (waiting up to 4s)...");
  try {
    await page.waitForFunction((btnText) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.textContent && b.textContent.includes(btnText));
    }, { timeout: 4000 }, modalButtonText);
    
    console.log("[TERMS GUARDIAN] Terms modal detected. Clicking accept...");
    await page.evaluate((btnText) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acceptBtn = buttons.find(b => b.textContent && b.textContent.includes(btnText));
      if (acceptBtn) acceptBtn.click();
    }, modalButtonText);
    
    await page.waitForFunction((btnText) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return !buttons.some(b => b.textContent && b.textContent.includes(btnText));
    }, { timeout: 5000 }, modalButtonText);
    console.log("[TERMS GUARDIAN] Terms modal dismissed successfully.");
    await delay(1000);
  } catch (e) {
    console.log("Terms modal did not appear or was already accepted.");
  }
}

async function safeClick(page, selector, timeout = 10000) {
  await handleTermsModal(page);
  await page.waitForSelector(selector, { timeout });
  await page.click(selector);
}

async function safeType(page, selector, text, timeout = 10000) {
  await handleTermsModal(page);
  await page.waitForSelector(selector, { timeout });
  await page.type(selector, text);
}

async function safeClickButtonByText(page, btnText, timeout = 10000) {
  await handleTermsModal(page);
  console.log(`Waiting for button/link containing text: "${btnText}"...`);
  await page.waitForFunction((text) => {
    const buttons = Array.from(document.querySelectorAll('button, a, div, span'));
    return buttons.some(b => b.textContent && b.textContent.includes(text));
  }, { timeout }, btnText);

  await page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll('button, a, div, span'));
    const target = buttons.find(b => b.textContent && b.textContent.includes(text));
    if (target) target.click();
  }, btnText);
  await delay(1000);
}

async function clickSelectTriggerByPlaceholder(page, placeholderText) {
  await handleTermsModal(page);
  console.log(`Waiting for select trigger matching placeholder/value: "${placeholderText}"...`);
  await page.waitForFunction((placeholder) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(b => {
      const text = b.textContent || "";
      return text.includes(placeholder) || 
             (placeholder === 'Select business type' && (text.includes('Goods & Services') || text.includes('Goods') || text.includes('Services')));
    });
  }, { timeout: 10000 }, placeholderText);

  await page.evaluate((placeholder) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const trigger = buttons.find(b => {
      const text = b.textContent || "";
      return text.includes(placeholder) || 
             (placeholder === 'Select business type' && (text.includes('Goods & Services') || text.includes('Goods') || text.includes('Services')));
    });
    if (trigger) trigger.click();
  }, placeholderText);
  await delay(1000);
}

async function selectOptionByText(page, optionText) {
  console.log(`Waiting for select option with text: "${optionText}"...`);
  await page.waitForFunction((text) => {
    const options = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], div'));
    return options.some(el => el.textContent && el.textContent.trim() === text);
  }, { timeout: 10000 }, optionText);

  const clicked = await page.evaluate((text) => {
    const options = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], div'));
    const targetOption = options.find(el => el.textContent && el.textContent.trim() === text);
    if (targetOption) {
      targetOption.click();
      return true;
    }
    return false;
  }, optionText);

  if (!clicked) {
    throw new Error(`Failed to click option: "${optionText}"`);
  }
  await delay(1000);
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
    // FLOW A: CUSTOMER LOGIN & ONBOARDING
    // ============================================
    console.log("\n--- FLOW A: CUSTOMER LOGIN ---");
    console.log("Navigating to login page...");
    await page.goto('http://localhost:8080/auth?mode=login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '01_login_page.png') });

    console.log("Typing customer credentials...");
    await safeType(page, 'input[id="email"]', shopperEmail);
    await safeType(page, 'input[id="password"]', shopperPassword);
    await page.screenshot({ path: path.join(screenshotsDir, '02_login_filled.png') });

    console.log("Submitting login form...");
    await page.click('button[type="submit"]');

    console.log("Waiting for onboarding/dashboard load...");
    await page.waitForFunction(() => {
      return window.location.pathname.includes('/onboarding') || 
             window.location.pathname.includes('/customer');
    }, { timeout: 15000 });

    console.log(`Current URL after login: ${page.url()}`);
    await page.screenshot({ path: path.join(screenshotsDir, '03_after_login.png') });

    // Handle onboarding if redirected there
    if (page.url().includes('/onboarding')) {
      console.log("Onboarding page detected. Waiting for 'Complete Setup' button...");
      await page.screenshot({ path: path.join(screenshotsDir, '04_onboarding_page.png') });
      
      await safeClickButtonByText(page, 'Complete Setup');
      
      console.log("Clicked Complete Setup. Waiting for dashboard navigation...");
      await page.waitForFunction(() => {
        return window.location.pathname.includes('/customer');
      }, { timeout: 15000 });
      console.log(`URL after customer onboarding: ${page.url()}`);
      await page.screenshot({ path: path.join(screenshotsDir, '05_customer_dashboard.png') });
    }

    // Nav to discover
    console.log("Navigating to Discover page...");
    await page.goto('http://localhost:8080/customer/discover', { waitUntil: 'networkidle2' });
    await handleTermsModal(page); // Accept terms if they popped up on navigation
    await delay(3000); // Allow masonry items to load
    await page.screenshot({ path: path.join(screenshotsDir, '06_discover_page.png') });

    // Find any business card or item to click
    console.log("Checking for items on Discover page...");
    const itemsExist = await page.evaluate(() => {
      const cards = document.querySelectorAll('div.break-inside-avoid');
      return cards.length > 0;
    });

    console.log(`Items/Stores found on discover page: ${itemsExist}`);

    if (itemsExist) {
      console.log("Clicking on the first discover item card to open details...");
      await page.waitForSelector('div.break-inside-avoid', { timeout: 10000 });
      await page.click('div.break-inside-avoid');
      
      console.log("Waiting for item dialog details to load...");
      await page.waitForSelector('[role="dialog"], [class*="DialogContent"]', { timeout: 10000 });
      await page.screenshot({ path: path.join(screenshotsDir, '07_discover_item_modal.png') });

      // Click "Inquire in Store" or click Store link in modal to go to Business Public Profile
      console.log("Clicking to visit the store profile...");
      const navToStoreSuccess = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"], [class*="DialogContent"]');
        if (!dialog) return false;
        
        // Find store button in dialog footer
        const footer = dialog.querySelector('.p-4.border-t');
        if (footer) {
          const buttons = Array.from(footer.querySelectorAll('button'));
          // Find specifically the button containing the store icon
          const storeBtn = buttons.find(b => b.querySelector('svg.lucide-store') || (b.className.includes('w-12') && !b.textContent));
          if (storeBtn) {
            storeBtn.click();
            return true;
          }
        }
        
        const buttons = Array.from(dialog.querySelectorAll('button'));
        const storeBtn = buttons.find(b => b.querySelector('svg.lucide-store') || b.textContent.includes('Inquire in Store'));
        if (storeBtn) {
          storeBtn.click();
          return true;
        }
        return false;
      });

      console.log(`Click action success: ${navToStoreSuccess}`);
      if (navToStoreSuccess) {
        console.log("Waiting for store public profile URL path...");
        await page.waitForFunction(() => {
          return window.location.pathname.startsWith('/business/');
        }, { timeout: 15000 });
        await delay(2000);
        await handleTermsModal(page);
        console.log(`Current URL after visiting store: ${page.url()}`);
        await page.screenshot({ path: path.join(screenshotsDir, '08_store_public_profile.png') });

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
        if (clickedMsg) {
          console.log("Waiting for chat message page to load...");
          await page.waitForSelector('span, div', { timeout: 15000 });
          await handleTermsModal(page);
          
          console.log("Selecting the conversation in the sidebar list...");
          const clickedSidebarItem = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('div.divide-y button'));
            const syntaxBtn = buttons.find(b => b.textContent && b.textContent.includes('syntax services'));
            if (syntaxBtn) {
              syntaxBtn.click();
              return true;
            }
            const fallbackBtn = buttons.find(b => b.textContent && b.textContent.includes('syntax'));
            if (fallbackBtn) {
              fallbackBtn.click();
              return true;
            }
            if (buttons.length > 0) {
              buttons[0].click();
              return true;
            }
            return false;
          });

          console.log(`Sidebar item click trigger status: ${clickedSidebarItem}`);
          console.log("Waiting for chat message input box to load...");
          await page.waitForSelector('input[placeholder="Type a message..."]', { timeout: 15000 });
          await handleTermsModal(page);
          console.log(`Current URL after Message click: ${page.url()}`);
          await page.screenshot({ path: path.join(screenshotsDir, '09_chat_inbox.png') });

          // Send a chat message!
          console.log("Typing message in chat...");
          await page.evaluate(() => {
            const input = document.querySelector('input[placeholder="Type a message..."]');
            if (input) {
              input.value = "Hello from Antigravity E2E Live Test! Let's build something great.";
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });
          await page.screenshot({ path: path.join(screenshotsDir, '10_chat_message_typed.png') });

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
          await page.screenshot({ path: path.join(screenshotsDir, '11_chat_message_sent.png') });
        }
      }
    } else {
      console.log("No listings found on Discover page to message. Continuing...");
    }

    // Logout
    console.log("Logging out of customer account...");
    await page.evaluate(() => localStorage.clear());
    await delay(1000);

    // ============================================
    // FLOW B: MERCHANT LOGIN, ONBOARDING & REGISTRATION
    // ============================================
    console.log("\n--- FLOW B: MERCHANT LOGIN ---");
    console.log("Navigating to login page for merchant...");
    await page.goto('http://localhost:8080/auth?mode=login', { waitUntil: 'networkidle2' });
    await safeType(page, 'input[id="email"]', merchantEmail);
    await safeType(page, 'input[id="password"]', merchantPassword);
    await page.click('button[type="submit"]');

    console.log("Waiting for merchant post-login page load...");
    await page.waitForFunction(() => {
      return window.location.pathname.includes('/onboarding') || 
             window.location.pathname.includes('/customer') ||
             window.location.pathname.includes('/business');
    }, { timeout: 15000 });

    console.log(`Current URL after merchant login: ${page.url()}`);
    await page.screenshot({ path: path.join(screenshotsDir, '12_merchant_after_login.png') });

    // Handle onboarding if redirected there
    if (page.url().includes('/onboarding')) {
      console.log("Onboarding page detected. Clicking 'Complete Setup'...");
      await safeClickButtonByText(page, 'Complete Setup');
      await page.waitForFunction(() => {
        return window.location.pathname.includes('/customer') || window.location.pathname.includes('/business');
      }, { timeout: 15000 });
      console.log(`URL after merchant onboarding: ${page.url()}`);
    }

    // Check if already registered as a merchant
    const isAlreadyMerchant = page.url().includes('/business') || await page.evaluate(() => {
      return localStorage.getItem('string_active_role_view') === 'business';
    });

    if (isAlreadyMerchant) {
      console.log("[MERCHANT DETECTOR] User is already registered as a merchant. Skipping registration modal expansion...");
      if (!page.url().includes('/business')) {
        await page.goto('http://localhost:8080/business', { waitUntil: 'networkidle2' });
      }
    } else {
      // Nav to customer profile to register business
      console.log("Navigating to Profile page to initialize Merchant Studio Node...");
      await page.goto('http://localhost:8080/customer/profile', { waitUntil: 'networkidle2' });
      
      // Auto-accept terms
      await handleTermsModal(page);

      await page.waitForSelector('button', { timeout: 10000 });
      await page.screenshot({ path: path.join(screenshotsDir, '13_customer_profile.png') });

      // Click "String Merchant Partnership" accordion trigger
      console.log("Expanding Merchant Partnership accordion...");
      await safeClickButtonByText(page, 'String Merchant Partnership');

      console.log("Waiting for 'Become a String Partner' button to appear...");
      await page.waitForFunction(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(b => b.textContent && b.textContent.includes('Become a String Partner'));
      }, { timeout: 5000 });
      await page.screenshot({ path: path.join(screenshotsDir, '14_merchant_partnership_expanded.png') });

      // Click Launch Merchant Studio button to open registration modal
      console.log("Opening merchant registration dialog...");
      await safeClickButtonByText(page, 'Become a String Partner');
      
      console.log("Waiting for dialog input field to appear...");
      await page.waitForSelector('input[placeholder="e.g. Ankara Hub, Campus Bites"]', { timeout: 10000 });
      await page.screenshot({ path: path.join(screenshotsDir, '15_merchant_modal_open.png') });

      // Fill Shop details
      console.log("Filling company name...");
      await safeType(page, 'input[placeholder="e.g. Ankara Hub, Campus Bites"]', 'Mary Gourmet Kitchen');

      console.log("Selecting business type...");
      await clickSelectTriggerByPlaceholder(page, 'Select business type');
      await selectOptionByText(page, '🏪 Both Goods & Services');

      console.log("Selecting location area...");
      await clickSelectTriggerByPlaceholder(page, 'Area');
      await selectOptionByText(page, 'Lagos Garage');

      console.log("Selecting location street...");
      await clickSelectTriggerByPlaceholder(page, 'Street');
      await selectOptionByText(page, 'Ibadan Road');

      await page.screenshot({ path: path.join(screenshotsDir, '16_merchant_modal_filled.png') });

      // Click launch merchant studio button
      console.log("Submitting store registration form...");
      await safeClickButtonByText(page, 'Launch Merchant Studio');
      await page.waitForFunction(() => {
        return window.location.pathname.includes('/business');
      }, { timeout: 15000 });
      await delay(3000);
      console.log(`Current URL after registration: ${page.url()}`);
      await page.screenshot({ path: path.join(screenshotsDir, '17_merchant_dashboard.png') });
    }

    // Go to upload page
    console.log("Navigating to Business Upload Catalog page...");
    await page.goto('http://localhost:8080/business/upload', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[id="product-name"]', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, '18_upload_page.png') });

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
    await page.screenshot({ path: path.join(screenshotsDir, '19_product_form_filled.png') });

    console.log("Submitting product catalog item...");
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    });
    await delay(5000);
    await page.screenshot({ path: path.join(screenshotsDir, '20_product_upload_completed.png') });

    // Switch to Service tab
    console.log("Switching to Service tab...");
    await page.click('[role="tablist"] button:nth-child(2)');
    
    console.log("Waiting for Service form elements to appear...");
    await page.waitForSelector('input[id="service-name"]', { timeout: 10000 });
    await page.waitForSelector('textarea[id="service-desc"]', { timeout: 10000 });
    await page.waitForSelector('input[placeholder="e.g., 2-3 hours"]', { timeout: 10000 });
    await page.waitForSelector('input[placeholder="Add location"]', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, '21_service_tab_open.png') });

    // Fill Service details
    console.log("Filling service details...");
    await page.evaluate(() => {
      document.querySelector('input[id="service-name"]').value = 'Chef Private Catering';
      document.querySelector('input[id="service-name"]').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('textarea[id="service-desc"]').value = 'Hire a professional private chef for small home events and custom brunch preparations.';
      document.querySelector('textarea[id="service-desc"]').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('input[placeholder="e.g., 2-3 hours"]').value = '3-4 hours';
      document.querySelector('input[placeholder="e.g., 2-3 hours"]').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('input[placeholder="Add location"]').value = 'Lagos Garage';
      document.querySelector('input[placeholder="Add location"]').dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Add location click
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent === 'Add');
      if (addBtn) addBtn.click();
    });
    await delay(800);

    console.log("Attaching service images...");
    const serviceImgInput = await page.$('input[id="service-images"]');
    await serviceImgInput.uploadFile(path.join(process.cwd(), 'burger.png'));
    await delay(3000); // Wait for compression and upload
    await page.screenshot({ path: path.join(screenshotsDir, '22_service_form_filled.png') });

    console.log("Submitting service catalog item...");
    await page.evaluate(() => {
      const activeForm = document.querySelector('form:not([class*="hidden"])') || document.querySelector('form');
      if (activeForm) {
        activeForm.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    });
    await delay(5000);
    await page.screenshot({ path: path.join(screenshotsDir, '23_service_upload_completed.png') });

    console.log("E2E Live Test suite finished successfully!");

  } catch (err) {
    console.error("Test execution failed:", err);
    try {
      await page.screenshot({ path: path.join(screenshotsDir, '99_failure_screenshot.png') });
      console.log(`Saved failure screenshot. Current URL: ${page.url()}`);
    } catch (screerr) {
      console.error("Could not capture failure screenshot:", screerr);
    }
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

run();
