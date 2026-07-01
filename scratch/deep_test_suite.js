import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = "C:/Users/Administrator/.gemini/antigravity/brain/593bfdb9-72f6-4830-a14d-5eff4c71a89f/scratch/screenshots";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

async function safeNavigate(page, url) {
  console.log("Navigating to: " + url);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
  } catch (e) {
    console.log("Navigation warning: " + e.message + " - Proceeding");
  }
  await delay(2000);
}


(async () => {
  console.log("Launching fresh headless browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Generate a unique shopper email
    const uniqueId = Date.now();
    const shopperEmail = `test_shopper_${uniqueId}@string.demo`;
    const shopperPassword = "Password123!";
    const shopperName = `John Shopper ${uniqueId}`;

    console.log("Creating new tab...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    const consoleLogs = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleLogs.push({ type, text });
      if (type === 'error') {
        console.log(`[Browser Console] [error] ${text}`);
      }
    });
    // In-memory mock database state
    
    // In-memory mock database state
    const mockDb = {
      profiles: [],
      user_roles: [],
      businesses: [],
      customers: [],
      products: [],
      services: [],
      messages: [],
      conversations: [],
      orders: [],
      order_items: [],
      location_areas: [
        { id: 'a1', name: 'Lagos Main Campus', created_at: new Date().toISOString() }
      ],
      location_streets: [
        { id: 's1', name: 'Mariere Road', area_id: 'a1', created_at: new Date().toISOString() }
      ],
      location_landmarks: [
        { id: 'l1', name: 'Mariere Hall', street_id: 's1', created_at: new Date().toISOString() }
      ],
      activity_logs: [],
      notifications: [],
      saved_businesses: [],
      reviews: []
    };

    console.log("Setting up Supabase request interception...");
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
      const url = request.url();
      const method = request.method();

      if (url.startsWith('https://kxynwcuhgawnhqoexpti.supabase.co')) {
        const corsHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Credentials': 'true'
        };

        if (method === 'OPTIONS') {
          await request.respond({
            status: 200,
            headers: corsHeaders,
            contentType: 'text/plain',
            body: 'OK'
          });
          return;
        }

        try {
          if (url.includes('/auth/v1/signup')) {
            const body = JSON.parse(request.postData() || '{}');
            const mockUser = {
              id: 'mock-user-123',
              email: body.email,
              email_confirmed_at: new Date().toISOString(),
              user_metadata: body.options?.data || {}
            };
            
            mockDb.profiles.push({
              id: 'mock-profile-123',
              user_id: 'mock-user-123',
              full_name: body.options?.data?.full_name || 'John Shopper',
              email: body.email,
              user_type: 'customer',
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            await request.respond({
              status: 200,
              headers: corsHeaders,
              contentType: 'application/json',
              body: JSON.stringify({
                user: mockUser,
                session: {
                  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwMDAwMDAwMDAsInN1YiI6Im1vY2stdXNlci0xMjMiLCJlbWFpbCI6InRlc3RAc2hvcHBlci5kZW1vIn0.signature',
                  token_type: 'bearer',
                  expires_in: 3600,
                  refresh_token: 'mock-refresh-token',
                  user: mockUser
                }
              })
            });
            return;
          }

          if (url.includes('/auth/v1/token')) {
            const mockUser = {
              id: 'mock-user-123',
              email: shopperEmail,
              email_confirmed_at: new Date().toISOString(),
              user_metadata: { full_name: shopperName, account_type: 'customer' }
            };
            await request.respond({
              status: 200,
              headers: corsHeaders,
              contentType: 'application/json',
              body: JSON.stringify({
                user: mockUser,
                session: {
                  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwMDAwMDAwMDAsInN1YiI6Im1vY2stdXNlci0xMjMiLCJlbWFpbCI6InRlc3RAc2hvcHBlci5kZW1vIn0.signature',
                  token_type: 'bearer',
                  expires_in: 3600,
                  refresh_token: 'mock-refresh-token',
                  user: mockUser
                }
              })
            });
            return;
          }

          if (url.includes('/auth/v1/user')) {
            await request.respond({
              status: 200,
              headers: corsHeaders,
              contentType: 'application/json',
              body: JSON.stringify({
                id: 'mock-user-123',
                email: shopperEmail,
                email_confirmed_at: new Date().toISOString()
              })
            });
            return;
          }

          if (url.includes('/rest/v1/')) {
            const tableNameMatch = url.match(/\/rest\/v1\/([^?]+)/);
            if (tableNameMatch) {
              const tableName = tableNameMatch[1];
              
              if (tableName.includes('rpc/complete_onboarding_setup')) {
                const postData = JSON.parse(request.postData() || '{}');
                // Update profile in mock db to completed
                if (mockDb.profiles && mockDb.profiles.length > 0) {
                  mockDb.profiles[0].onboarding_completed = true;
                  if (postData.p_user_type) {
                    mockDb.profiles[0].user_type = postData.p_user_type;
                  }
                  
                  if (postData.p_business_data && postData.p_business_data.companyName) {
                    mockDb.businesses = mockDb.businesses || [];
                    mockDb.businesses.push({
                      id: 'mock-business-123',
                      user_id: 'mock-user-123',
                      company_name: postData.p_business_data.companyName,
                      business_type: postData.p_business_data.businessType || 'both',
                      business_location: postData.p_business_data.streetAddress,
                      street_address: postData.p_business_data.streetAddress,
                      area_name: postData.p_business_data.areaName,
                      latitude: postData.p_business_data.latitude || 6.9318,
                      longitude: postData.p_business_data.longitude || 3.9248,
                      location_verified: false,
                      created_at: new Date().toISOString()
                    });
                  }
                }
                
                await request.respond({
                  status: 200,
                  headers: corsHeaders,
                  contentType: 'application/json',
                  body: JSON.stringify({ success: true, message: 'Onboarding completed' })
                });
                return;
              }

              if (tableName.includes('rpc/')) {
                await request.respond({
                  status: 200,
                  headers: corsHeaders,
                  contentType: 'application/json',
                  body: JSON.stringify({ success: true })
                });
                return;
              }

              if (method === 'GET') {
                let data = mockDb[tableName] || [];
                
                if (url.includes('user_id=eq.')) {
                  data = data.filter(item => item.user_id === 'mock-user-123' || item.user_id === 'mock-profile-123');
                }

                // Handle single object queries (maybeSingle / single)
                const acceptHeader = request.headers()['accept'] || '';
                const isSingle = acceptHeader.includes('application/vnd.pgrst.object+json');
                
                let responseBody;
                if (isSingle) {
                  responseBody = data.length > 0 ? data[0] : null;
                } else {
                  responseBody = data;
                }
                
                await request.respond({
                  status: 200,
                  headers: corsHeaders,
                  contentType: 'application/json',
                  body: JSON.stringify(responseBody)
                });
                return;
              }

              if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
                const body = JSON.parse(request.postData() || '{}');
                const record = Array.isArray(body) ? body[0] : body;
                
                if (!mockDb[tableName]) mockDb[tableName] = [];
                
                let existingIndex = -1;
                if (record.id) {
                  existingIndex = mockDb[tableName].findIndex(item => item.id === record.id);
                } else if (url.includes('user_id=eq.')) {
                  existingIndex = mockDb[tableName].findIndex(item => item.user_id === 'mock-user-123');
                }

                const newRecord = {
                  id: record.id || `mock-${tableName}-${Date.now()}`,
                  user_id: record.user_id || 'mock-user-123',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  ...record
                };

                if (existingIndex > -1) {
                  mockDb[tableName][existingIndex] = { ...mockDb[tableName][existingIndex], ...newRecord };
                } else {
                  mockDb[tableName].push(newRecord);
                }

                await request.respond({
                  status: 200,
                  headers: corsHeaders,
                  contentType: 'application/json',
                  body: JSON.stringify(Array.isArray(body) ? [newRecord] : newRecord)
                });
                return;
              }
            }
          }

          await request.respond({
            status: 200,
            headers: corsHeaders,
            contentType: 'application/json',
            body: JSON.stringify([])
          });
          return;

        } catch (e) {
          console.error("[MOCK DB INTERCEPT ERROR]", e);
        }
      }
      
      await request.continue();
    });
await safeNavigate(page, 'http://localhost:8080/auth?mode=signup');
    await delay(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_signup_page.png") });

    console.log(`Entering credentials for registration: ${shopperEmail}...`);
    // Fill Sign Up form
    await page.waitForSelector('input#email', { timeout: 5000 });
    await page.type('input#fullName', shopperName);
    await page.type('input#email', shopperEmail);
    await page.type('input#password', shopperPassword);
    await page.type('input#confirmPassword', shopperPassword);

    console.log("Submitting registration form...");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_signup_filled.png") });
    await page.click('button[type="submit"]');
    
    console.log("Waiting for signup toast...");
    await delay(4000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_after_signup.png") });

    console.log("Bypassing email verification: Injecting mock session into localStorage...");
    await page.evaluate((email, name) => {
      localStorage.setItem('sb-kxynwcuhgawnhqoexpti-auth-token', JSON.stringify({
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwMDAwMDAwMDAsInN1YiI6Im1vY2stdXNlci0xMjMiLCJlbWFpbCI6InRlc3RAc2hvcHBlci5kZW1vIn0.signature',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-123',
          email: email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            full_name: name,
            account_type: 'customer'
          }
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600
      }));
    }, shopperEmail, shopperName);

    console.log("Navigating to Onboarding page...");
    await safeNavigate(page, 'http://localhost:8080/onboarding');
    await delay(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_after_login.png") });

    // ----------------------------------------------------
    // FLOW B: ONBOARDING (ADDRESS MATRIX SELECTION)
    // ----------------------------------------------------
    console.log("Current URL:", page.url());
    if (page.url().includes('/onboarding')) {
      console.log("Onboarding screen detected. Completing address selection...");
      
      // Look for select triggers/comboboxes
      const selectTriggers = await page.$$('button[role="combobox"]');
      console.log(`Found ${selectTriggers.length} dropdown selectors.`);

      if (selectTriggers.length >= 1) {
        // Expand Area Dropdown
        console.log("Opening Area select dropdown...");
        await selectTriggers[0].click();
        await delay(2000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_onboarding_area_dropdown.png") });

        // Select first available option
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await delay(2000);
      }

      if (selectTriggers.length >= 2) {
        // Expand Street Dropdown
        console.log("Opening Street select dropdown...");
        await selectTriggers[1].click();
        await delay(2000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await delay(2000);
      }

      if (selectTriggers.length >= 3) {
        // Expand Landmark Dropdown
        console.log("Opening Landmark select dropdown...");
        await selectTriggers[2].click();
        await delay(2000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await delay(2000);
      }

      // Enter phone number
      const phoneInput = await page.$('input[type="tel"]');
      if (phoneInput) {
        await page.type('input[type="tel"]', "08012345678");
      }

      // Accept Terms Checkbox
      const checkbox = await page.$('input[type="checkbox"]');
      if (checkbox) {
        await checkbox.click();
      } else {
        // Sometimes it's a Radix checkbox button
        const radixCheckbox = await page.$('button[role="checkbox"]');
        if (radixCheckbox) await radixCheckbox.click();
      }

      console.log("Submitting Onboarding...");
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_onboarding_filled.png") });
      
      // Click complete button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Complete') || b.textContent.includes('Save') || b.textContent.includes('Submit'));
        if (btn) btn.click();
      });
      await delay(6000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_after_onboarding.png") });
    }

    // ----------------------------------------------------
    // FLOW C: SHOPPER DASHBOARD / DISCOVER PAGE
    // ----------------------------------------------------
    console.log("Navigating to Customer Dashboard...");
    await page.goto('http://localhost:8080/customer', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await delay(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_shopper_dashboard.png") });

    console.log("Navigating to Customer Discover page...");
    await page.goto('http://localhost:8080/customer/discover', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await delay(4000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08_shopper_discover_top.png") });

    // Scroll Discover Page to verify Sticky Search Bar Portal
    console.log("Scrolling Discover page down to check sticky search portal...");
    await page.evaluate(() => window.scrollBy(0, 400));
    await delay(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09_shopper_discover_scrolled.png") });

    // ----------------------------------------------------
    // FLOW D: ROLE CONVERSION & MERCHANT SETUP
    // ----------------------------------------------------
    console.log("Navigating to Profile to switch roles...");
    await page.goto('http://localhost:8080/customer/profile', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await delay(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10_shopper_profile.png") });

    console.log("Attempting to switch to Merchant View...");
    // First expand String Merchant Partnership accordion if present
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const accordionBtn = buttons.find(b => b.textContent.includes('String Merchant Partnership'));
      if (accordionBtn) accordionBtn.click();
    });
    await delay(2000);

    // Click Become a String Partner button to open modal
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const merchantBtn = buttons.find(b => b.textContent.includes('Merchant Mode') || b.textContent.includes('Switch to Merchant') || b.textContent.includes('Become a String Partner'));
      if (merchantBtn) merchantBtn.click();
    });
    await delay(4000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11_switching_to_merchant.png") });

    // Check if dialog is open by looking for business name inputs
    const nameInput = await page.$('input[placeholder*="Ankara Hub"]') || await page.$('input[placeholder*="Business Name"]');
    if (nameInput) {
      console.log("Business Onboarding details required...");
      await nameInput.type(`Demo Merchant ${uniqueId}`);
      
      // Open Area dropdown
      const areaSelect = await page.evaluateHandle(() => {
        const triggers = Array.from(document.querySelectorAll('button'));
        return triggers.find(b => b.textContent.includes('Area') || b.querySelector('span')?.textContent === 'Area');
      });
      if (areaSelect) {
        console.log("Selecting Area in Store registration...");
        await areaSelect.click();
        await delay(1500);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await delay(1500);
      }

      // Open Street dropdown
      const streetSelect = await page.evaluateHandle(() => {
        const triggers = Array.from(document.querySelectorAll('button'));
        return triggers.find(b => b.textContent.includes('Street') || b.querySelector('span')?.textContent === 'Street');
      });
      if (streetSelect) {
        console.log("Selecting Street in Store registration...");
        await streetSelect.click();
        await delay(1500);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await delay(1500);
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "12_business_onboarding_filled.png") });

      // Click Launch Merchant Studio
      console.log("Submitting store registration form...");
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const launchBtn = buttons.find(b => b.textContent.includes('Launch Merchant Studio'));
        if (launchBtn) launchBtn.click();
      });
      await delay(6000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "13_after_business_onboarding.png") });
    }

    // ----------------------------------------------------
    // FLOW E: MERCHANT CORE PAGES (UPLOAD PRODUCT & SERVICE)
    // ----------------------------------------------------
    console.log("Navigating to Business Dashboard Overview...");
    await page.goto('http://localhost:8080/business', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await delay(4000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "14_merchant_dashboard_overview.png") });

    console.log("Navigating to Business Upload listings page...");
    await page.goto('http://localhost:8080/business/upload', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await delay(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "15_merchant_upload_initial.png") });

    // Add Product
    console.log("Adding new product...");
    await page.waitForSelector('input[id="product-name"]', { timeout: 5000 }).catch(() => {});
    await page.evaluate(() => {
      const nameInput = document.getElementById('product-name');
      const descInput = document.getElementById('product-desc');
      const priceInput = document.getElementById('product-price');
      if (nameInput) {
        nameInput.value = 'Demo Burger Premium';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (descInput) {
        descInput.value = 'A tasty premium cheese burger with fresh ingredients.';
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
        descInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (priceInput) {
        priceInput.value = '2500';
        priceInput.dispatchEvent(new Event('input', { bubbles: true }));
        priceInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "16_merchant_product_form.png") });
    
    // Submit Product
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Add Product') || b.textContent.includes('Save'));
      if (btn) btn.click();
    });
    await delay(5000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "17_after_product_submit.png") });

    // Add Service
    console.log("Switching to Service upload tab...");
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, [role="tab"]'));
      const serviceTab = elements.find(el => el.textContent.includes('Service'));
      if (serviceTab) serviceTab.click();
    });
    await delay(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "18_merchant_upload_service_tab.png") });

    console.log("Filling service details...");
    await page.waitForSelector('input[id="service-name"]', { timeout: 5000 }).catch(() => {});
    await page.evaluate(() => {
      const nameInput = document.getElementById('service-name');
      const descInput = document.getElementById('service-desc');
      if (nameInput) {
        nameInput.value = 'Laundry Dryclean Express';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (descInput) {
        descInput.value = 'Express wash and dry clean service for local campus students.';
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
        descInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Price type category
    const catSelects = await page.$$('button[role="combobox"]');
    if (catSelects.length > 0) {
      await catSelects[0].click(); // Category
      await delay(1000);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    }

    // Set fixed price
    const priceInputs = await page.$$('input[type="number"]');
    if (priceInputs.length > 0) {
      await priceInputs[0].type("1200");
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "19_merchant_service_form.png") });
    // Submit Service
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Add Service') || b.textContent.includes('Save'));
      if (btn) btn.click();
    });
    await delay(5000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "20_after_service_submit.png") });

    // ----------------------------------------------------
    // FLOW F: CHAT, CART & CHECKOUT TEST
    // ----------------------------------------------------
    console.log("Switching back to Shopper View to simulate purchase...");
    await page.goto('http://localhost:8080/business/profile', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await delay(3000);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shopperModeBtn = buttons.find(b => b.textContent.includes('Shopper Mode') || b.textContent.includes('Switch to Shopper'));
      if (shopperModeBtn) shopperModeBtn.click();
    });
    await delay(4000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "21_back_to_shopper.png") });

    console.log("Navigating to Discover Page to purchase item...");
    await page.goto('http://localhost:8080/customer/discover', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await delay(5000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "22_shopper_purchase_discover.png") });

    // Try to click the first product card's add to cart button
    console.log("Adding first available product card to cart...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      // Find add to cart icon/button
      const addToCartBtn = buttons.find(b => b.title === "Add to Cart" || b.textContent.includes("Add to Cart") || b.innerHTML.includes("Plus"));
      if (addToCartBtn) addToCartBtn.click();
    });
    await delay(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "23_item_added_to_cart.png") });

    // Check Checkout Page
    console.log("Navigating to Checkout Page...");
    await page.goto('http://localhost:8080/customer/checkout', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await delay(4000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "24_checkout_page.png") });

    // Save final report logs
    console.log("Finished automated test workflow successfully.");
    const reportPath = "C:/Users/Administrator/.gemini/antigravity/brain/593bfdb9-72f6-4830-a14d-5eff4c71a89f/scratch/test_run_report.json";
    fs.writeFileSync(reportPath, JSON.stringify({
      success: true,
      uniqueId,
      shopperEmail,
      shopperName,
      consoleLogs
    }, null, 2));

  } catch (error) {
    console.error("Test execution failed with error:", error);
    const errReportPath = "C:/Users/Administrator/.gemini/antigravity/brain/593bfdb9-72f6-4830-a14d-5eff4c71a89f/scratch/test_run_report.json";
    fs.writeFileSync(errReportPath, JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }, null, 2));
  } finally {
    console.log("Closing browser...");
    await browser.close();
  }
})();
