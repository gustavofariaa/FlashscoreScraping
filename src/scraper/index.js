import { TIMEOUT_FAST } from '../constants/index.js';

// Helper: add random human-like delays
const randomDelay = (min = 1000, max = 3000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// ✅ Universal cookie / popup / overlay killer with debug
export const handleCookieConsent = async (page, debug = false) => {
  try {
    await page.evaluate(() => {
      const selectors = [
        '#onetrust-accept-btn-handler',
        'button[aria-label*="accept"]',
        'button[aria-label*="agree"]',
        '.didomi-popup__button--highlight',
        '.cookie-consent-accept',
        '#didomi-notice-agree-button',
        '.fc-cta-consent',
        '[id*="cookie-accept"]',
        '[class*="cookie-accept"]',
        '[class*="consent"] button'
      ];

      selectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) try { el.click(); } catch {}
      });

      Array.from(document.querySelectorAll('button')).forEach(btn => {
        const text = (btn.innerText || '').toLowerCase();
        if (text.includes('accept') || text.includes('agree') || text.includes('consent')) {
          try { btn.click(); } catch {}
        }
      });

      const overlaySelectors = ['[id*="overlay"]', '[class*="overlay"]', '[id*="consent"]', '[class*="consent"]', '[class*="cookie"]'];
      overlaySelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none';
          el.removeAttribute('aria-hidden');
        });
      });

      document.body.style.overflow = 'visible';
      document.body.style.position = 'static';
    });

    // Puppeteer-compatible wait
    await new Promise(resolve => setTimeout(resolve, 800));

    if (debug) console.log('✅ Cookie consent / overlays handled');
  } catch (err) {
    console.warn('⚠️ No cookie popup found or failed to dismiss:', err.message);
  }
};

// ✅ Page navigation helper with retries & logging
export const openPageAndNavigate = async (browser, url, retries = 3, debug = false) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      });

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Hide overlays aggressively
      await page.evaluate(() => {
        document.querySelectorAll('[class*="overlay"], [id*="overlay"]').forEach(el => {
          el.style.display = 'none';
        });
        document.body.style.overflow = 'visible';
      });

      // Handle cookies
      await handleCookieConsent(page, debug);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (debug) console.log(`✅ Successfully opened page: ${url}`);
      return page;
    } catch (error) {
      console.warn(`⚠️ Navigation attempt ${attempt}/${retries} failed for ${url}: ${error.message}`);
      if (attempt === retries) throw error;
      const waitTime = Math.min(5000 * attempt, 15000);
      console.log(`⏱ Waiting ${waitTime / 1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  // Safety: should never reach here, but just in case
  throw new Error('openPageAndNavigate completed without returning page');
};

// ✅ Click element safely with scroll into view
export const waitAndClick = async (page, selector, timeout = TIMEOUT_FAST, debug = false) => {
  await page.waitForSelector(selector, { timeout });
  await page.evaluate(sel => {
    const element = document.querySelector(sel);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.click();
    }
  }, selector);
  if (debug) console.log(`✅ Clicked element: ${selector}`);
};

// ✅ Safe selector wait with warning
export const waitForSelectorSafe = async (page, selector, timeout = TIMEOUT_FAST, debug = false) => {
  try {
    await page.waitForSelector(selector, { timeout });
    if (debug) console.log(`✅ Selector found: ${selector}`);
  } catch {
    console.warn(`⚠️ Selector "${selector}" not found within ${timeout}ms`);
  }
};

// ✅ Random delay between requests/matches
export const delayBetweenRequests = async (min = 4000, max = 7000, debug = false) => {
  await randomDelay(min, max);
  if (debug) console.log(`⏱ Delayed for ${min}-${max}ms`);
};
