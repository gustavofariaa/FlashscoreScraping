import puppeteer from 'puppeteer';
import { BASE_URL } from '../../constants/index.js';
import { handleCookieConsent } from '../../scraper/index.js';

const BASE_TIMEOUT = 90000;
const sleep = ms => new Promise(res => setTimeout(res, ms));

/**
 * Browser Manager - Handles smart browser lifecycle
 */
export class BrowserManager {
  constructor(options = {}) {
    this.browser = null;
    this.options = options;
    this.matchesProcessed = 0;
    this.startTime = Date.now();
    this.restartCount = 0; // Track number of restarts
    
    // Thresholds for restart
    this.MEMORY_THRESHOLD = 500 * 1024 * 1024; // 500MB
    this.PAGE_LEAK_THRESHOLD = 10; // Max open pages
    this.MATCH_THRESHOLD = 30; // Fallback: restart every 30 matches
    this.TIME_THRESHOLD = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Launch or restart browser
   */
  async launchBrowser() {
    try {
      // Close existing browser if any
      if (this.browser) {
        try {
          await this.browser.close();
        } catch (e) {
          console.warn(`⚠️ Error closing old browser: ${e.message}`);
        }
      }

      // Launch new browser
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Prevent /dev/shm issues
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        protocolTimeout: 120000 // 2 minutes timeout (increased from default)
      });

      // Handle cookie consent
      const page = await this.browser.newPage();
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: BASE_TIMEOUT });
      await sleep(2000);
      await handleCookieConsent(page);
      await page.close();

      this.matchesProcessed = 0;
      this.startTime = Date.now();

      return this.browser;
    } catch (err) {
      console.error(`❌ Failed to launch browser: ${err.message}`);
      throw err;
    }
  }

  /**
   * Check if browser should be restarted
   */
  async shouldRestart() {
    if (!this.browser) return true;

    try {
      // Check 1: Browser disconnected
      if (!this.browser.isConnected()) {
        console.log(`⚠️ Browser disconnected`);
        return true;
      }

      // Check 2: Too many pages open (memory leak indicator)
      const pages = await this.browser.pages();
      if (pages.length > this.PAGE_LEAK_THRESHOLD) {
        console.log(`⚠️ Too many pages open (${pages.length})`);
        return true;
      }

      // Check 3: Match threshold (fallback)
      if (this.matchesProcessed >= this.MATCH_THRESHOLD) {
        console.log(`⚠️ Match threshold reached (${this.matchesProcessed})`);
        return true;
      }

      // Check 4: Time threshold
      const runTime = Date.now() - this.startTime;
      if (runTime > this.TIME_THRESHOLD) {
        const minutes = Math.floor(runTime / 60000);
        console.log(`⚠️ Time threshold reached (${minutes} minutes)`);
        return true;
      }

      // Check 5: Memory usage (only works in headless mode)
      try {
        const metrics = await this.getMemoryUsage();
        if (metrics && metrics.JSHeapUsedSize > this.MEMORY_THRESHOLD) {
          const mb = Math.floor(metrics.JSHeapUsedSize / 1024 / 1024);
          console.log(`⚠️ Memory threshold exceeded (${mb}MB)`);
          return true;
        }
      } catch (e) {
        // Metrics not available in headed mode, skip
      }

      return false;
    } catch (err) {
      console.warn(`⚠️ Error checking browser health: ${err.message}`);
      return true; // Restart on error to be safe
    }
  }

  /**
   * Get memory usage metrics
   */
  async getMemoryUsage() {
    try {
      const pages = await this.browser.pages();
      if (pages.length === 0) return null;

      // Get metrics from first available page
      const page = pages[0];
      const metrics = await page.metrics();
      return metrics;
    } catch (e) {
      return null;
    }
  }

  /**
   * Restart browser without logging
   */
  async restart(reason = 'periodic maintenance') {
  // Silent restart - dashboard shows restart count
  await this.launchBrowser();
  this.restartCount++;
}

  /**
   * Increment match counter
   */
  incrementMatch() {
    this.matchesProcessed++;
  }

  /**
   * Get restart count
   */
  getRestartCount() {
    return this.restartCount;
  }

  /**
   * Get browser instance
   */
  getBrowser() {
    return this.browser;
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {
        console.warn(`⚠️ Error closing browser: ${e.message}`);
      }
    }
  }
}