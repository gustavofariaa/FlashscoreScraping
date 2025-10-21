import puppeteer from 'puppeteer';
import { BASE_URL, OUTPUT_PATH } from './constants/index.js';
import { parseArguments } from './cli/arguments/index.js';
import { selectFileType } from './cli/prompts/fileType/index.js';
import { selectCountry } from './cli/prompts/countries/index.js';
import { selectLeague } from './cli/prompts/leagues/index.js';
import { selectSeason } from './cli/prompts/season/index.js';
import { start, stop } from './cli/loader/index.js';
import { getMatchIdList, getMatchData } from './scraper/services/matches/index.js';
import { handleFileType } from './files/handle/index.js';
import { BrowserManager } from './utils/browsermanager/index.js';
import { saveCheckpoint, loadCheckpoint, deleteCheckpoint, hasCheckpoint, shouldResumeCheckpoint } from './utils/checkpoint/index.js';
import { initializeDashboard, displayDashboard } from './cli/dashboard/index.js';

const MATCH_RETRIES = 3;
const SAVE_INTERVAL = 10;
const CHECKPOINT_INTERVAL = 10;
const sleep = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  const options = parseArguments();
  const fileType = options.fileType || (await selectFileType());

  // ---- CLI flow: country, league, season ----
  const tempBrowser = await puppeteer.launch({ headless: options.headless });
  const country = options.country ? { name: options.country } : await selectCountry(tempBrowser);
  const league = options.league ? { name: options.league } : await selectLeague(tempBrowser, country?.id);
  const season = league?.url ? await selectSeason(tempBrowser, league?.url) : { name: league?.name, url: `${BASE_URL}/football/${country?.name}/${league?.name}` };
  await tempBrowser.close();

  const fileName = `${country?.name}_${season?.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  
  // ---- Check for existing checkpoint ----
  let checkpoint = null;
  if (hasCheckpoint(fileName)) {
    checkpoint = loadCheckpoint(fileName);
    if (checkpoint && shouldResumeCheckpoint(checkpoint)) {
      console.log(`\n🔄 Resuming from checkpoint...`);
    } else {
      checkpoint = null;
      deleteCheckpoint(fileName);
    }
  }

  console.info(`\n📝 Starting data collection for: ${fileName}`);
  console.info(`Output: ${OUTPUT_PATH}/${fileName}.${fileType}`);

  // ---- Initialize Browser Manager ----
  const browserManager = new BrowserManager(options);
  await browserManager.launchBrowser();
  console.log('✓ Browser initialized with smart memory management\n');

  // ---- Get all match IDs ----
  let matchIdList;
  if (checkpoint) {
    matchIdList = checkpoint.matchIdList;
    console.log(`✓ Loaded ${matchIdList.length} match IDs from checkpoint\n`);
  } else {
    start();
    matchIdList = await getMatchIdList(browserManager.getBrowser(), season?.url);
    stop();
  }

  // ---- Initialize or restore state ----
  let matchData = checkpoint?.matchData || {};
  let successCount = checkpoint?.successCount || 0;
  let failedMatches = checkpoint?.failedMatches || [];
  let processedMatchIds = checkpoint?.processedMatchIds || [];
  let startIndex = checkpoint?.lastIndex ? checkpoint.lastIndex + 1 : 0;
  
  // Timing tracking
  const scrapingStartTime = Date.now();
  let matchTimes = []; // Track time per match for average

  // ---- Initialize Dashboard ----
  const dashboardStats = {
    country: country?.name || '',
    league: league?.name || '',
    season: season?.name || '',
    total: matchIdList.length,
    processed: startIndex,
    success: successCount,
    failed: failedMatches.length,
    avgTime: 0,
    memory: 0,
    restarts: browserManager.getRestartCount(),
    startTime: scrapingStartTime,
    eta: 0
  };

  initializeDashboard(dashboardStats);

  // ---- Main scraping loop ----
  for (let i = startIndex; i < matchIdList.length; i++) {
    const matchId = matchIdList[i];

    // Skip if already processed
    if (processedMatchIds.includes(matchId)) {
      continue;
    }

    // ---- Check if browser should restart ----
    if (await browserManager.shouldRestart()) {
      await browserManager.restart('memory/performance threshold');
    }

    // ---- Scrape individual match ----
    const matchStartTime = Date.now();
    let success = false;
    
    for (let attempt = 1; attempt <= MATCH_RETRIES; attempt++) {
      try {
        const data = await getMatchData(browserManager.getBrowser(), matchId);
        if (!data) throw new Error('No data extracted');

        matchData[matchId] = data;
        successCount++;
        success = true;
        
        // Track timing
        const matchDuration = (Date.now() - matchStartTime) / 1000; // in seconds
        matchTimes.push(matchDuration);
        if (matchTimes.length > 50) matchTimes.shift(); // Keep last 50 for rolling average
        
        // Silent success - no console.log here
        break;
      } catch (err) {
        // Check if error is timeout/memory related
        const isTimeoutError = err.message.includes('timed out') || 
                               err.message.includes('Protocol error') ||
                               err.message.includes('Target closed');
        
        if (isTimeoutError && attempt < MATCH_RETRIES) {
          console.warn(`⚠️ Timeout error - forcing browser restart`);
          await browserManager.restart('timeout error');
        }
        
        if (attempt >= MATCH_RETRIES) {
          console.warn(`⚠️ All attempts failed for match ${matchId}: ${err.message}`);
        }
        
        if (attempt < MATCH_RETRIES) {
          await sleep(5000 * attempt);
        }
      }
    }

    if (!success) {
      failedMatches.push(matchId);
    }
    
    processedMatchIds.push(matchId);
    browserManager.incrementMatch();

    // ---- Update Dashboard ----
    const avgTime = matchTimes.length > 0 
      ? matchTimes.reduce((a, b) => a + b, 0) / matchTimes.length 
      : 0;
    
    const remainingMatches = matchIdList.length - processedMatchIds.length;
    const eta = remainingMatches * avgTime * 1000; // in milliseconds
    
    // Get current memory usage
    const memoryMetrics = await browserManager.getMemoryUsage();
    const memoryUsage = memoryMetrics ? memoryMetrics.JSHeapUsedSize : 0;
    
    dashboardStats.processed = processedMatchIds.length;
    dashboardStats.success = successCount;
    dashboardStats.failed = failedMatches.length;
    dashboardStats.avgTime = avgTime;
    dashboardStats.memory = memoryUsage;
    dashboardStats.restarts = browserManager.getRestartCount();
    dashboardStats.eta = eta;
    
    displayDashboard(dashboardStats);

    // ---- Save checkpoint periodically ----
    if ((processedMatchIds.length % CHECKPOINT_INTERVAL === 0) || !success) {
      saveCheckpoint(fileName, {
        matchData,
        matchIdList,
        successCount,
        failedMatches,
        processedMatchIds,
        lastIndex: i,
        totalMatches: matchIdList.length,
        processedCount: processedMatchIds.length,
        timestamp: Date.now()
      });
    }

    // ---- Save data file periodically ----
    if (successCount % SAVE_INTERVAL === 0 && successCount > 0) {
      handleFileType(matchData, fileType, fileName);
    }
  }

  // ---- Final save ----
  handleFileType(matchData, fileType, fileName);
  
  // ---- Cleanup ----
  await browserManager.close();
  deleteCheckpoint(fileName);

  console.info('\n✅ Data collection completed!');
  console.info(`Successfully scraped: ${successCount}/${matchIdList.length} matches`);
  if (failedMatches.length) {
    console.warn(`⚠️ Failed matches (${failedMatches.length}): ${failedMatches.join(', ')}`);
  }
  console.info(`\nData saved to: ${OUTPUT_PATH}/${fileName}.${fileType}\n`);
})();