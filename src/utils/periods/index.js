import { BASE_URL } from '../../constants/index.js';

const PAGE_TIMEOUT = 60000;

/**
 * Click a period button and wait for stats to load
 */
const clickPeriodButton = async (page, periodText) => {
  try {
    const clicked = await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll('button[data-testid="wcl-tab"]'));
      const button = buttons.find(btn => {
        const btnText = (btn.innerText || btn.textContent || '').trim().toUpperCase();
        return btnText === text.toUpperCase();
      });
      
      if (button) {
        button.click();
        return true;
      }
      return false;
    }, periodText);
    
    if (clicked) {
      await new Promise(r => setTimeout(r, 4000));
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

/**
 * Extract statistics after clicking a period button
 */
const extractPeriodStats = async (page, extractMatchStatistics) => {
  try {
    // Wait for stats to be present
    await page.waitForSelector("div[data-testid='wcl-statistics']", { timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // Try to expand collapsed sections
    await page.evaluate(() => {
      const expandButtons = document.querySelectorAll('button[aria-expanded="false"], [class*="expand"], [class*="accordion"]');
      expandButtons.forEach(btn => {
        try { btn.click(); } catch (e) {}
      });
    });
    await new Promise(r => setTimeout(r, 2000));
    
    // Extract statistics
    return await extractMatchStatistics(page);
  } catch (err) {
    return [];
  }
};

/**
 * Extract statistics for all periods (Full Time, 1st Half, 2nd Half)
 * @param {Page} page - Puppeteer page object
 * @param {string} matchId - Match ID
 * @param {Function} extractMatchStatistics - Statistics extraction function
 * @returns {Promise<Object>} Statistics for all periods
 */
export const extractAllPeriodStats = async (page, matchId, extractMatchStatistics) => {
  const stats = {
    fullTime: [],
    firstHalf: [],
    secondHalf: []
  };
  
  try {
    // Navigate to match summary
    const summaryUrl = `${BASE_URL}/match/${matchId}/#/match-summary/match-summary`;
    await page.goto(summaryUrl, { waitUntil: 'networkidle0', timeout: PAGE_TIMEOUT });
    await new Promise(r => setTimeout(r, 2000));
    
    // Click STATS tab
    const statsTabFound = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const statsLink = links.find(a => {
        const text = a.innerText?.toUpperCase() || '';
        return text.includes('STATS') || text.includes('STATISTICS');
      });
      if (statsLink) {
        statsLink.click();
        return true;
      }
      return false;
    });
    
    if (!statsTabFound) {
      return stats;
    }
    
    await new Promise(r => setTimeout(r, 5000));
    
    // Extract Full Time (already on MATCH by default after clicking STATS)
    stats.fullTime = await extractPeriodStats(page, extractMatchStatistics);
    
    // Click and extract 1ST HALF
    const firstHalfClicked = await clickPeriodButton(page, '1ST HALF');
    if (firstHalfClicked) {
      stats.firstHalf = await extractPeriodStats(page, extractMatchStatistics);
    }
    
    // Click and extract 2ND HALF
    const secondHalfClicked = await clickPeriodButton(page, '2ND HALF');
    if (secondHalfClicked) {
      stats.secondHalf = await extractPeriodStats(page, extractMatchStatistics);
    }
    
  } catch (err) {
    // Silent failure - return whatever was extracted
  }
  
  return stats;
};