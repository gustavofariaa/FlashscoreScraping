/**
 * Dashboard Display for Scraper
 */
const DASHBOARD_LINES = 11;
let isFirstRender = true;
let lastDashboardHeight = 0;

/**
 * Format time duration (milliseconds) to readable string
 */
const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format memory size
 */
const formatMemory = (bytes) => {
  if (!bytes) return 'N/A';
  const mb = Math.floor(bytes / 1024 / 1024);
  return `${mb}MB`;
};

/**
 * Create progress bar
 */
const createProgressBar = (current, total, width = 25) => {
  const percentage = Math.floor((current / total) * 100);
  const filled = Math.floor((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar}  ${percentage}% (${current}/${total})`;
};

/**
 * Clear the console completely
 */
const clearConsole = () => {
  // Clear console for Windows/Unix
  process.stdout.write('\x1Bc');
};

/**
 * Display dashboard (clears and redraws entire screen)
 */
export const displayDashboard = (stats) => {
  const {
    country = '',
    league = '',
    season = '',
    total = 0,
    processed = 0,
    success = 0,
    failed = 0,
    succeededInc = 0,
    failedInc = 0,
    avgTime = 0,
    memory = 0,
    restarts = 0,
    checkpointCount = 0,
    checkpointPosition = 0,
    startTime = Date.now(),
    eta = 0
  } = stats;
  
  // Calculate values
  const duration = formatDuration(Date.now() - startTime);
  const etaFormatted = formatDuration(eta);
  const memoryFormatted = formatMemory(memory);
  const avgTimeFormatted = avgTime > 0 ? `${avgTime.toFixed(1)}s` : 'N/A';
  
  // Build the dashboard with proper padding (70 chars width)
  const progressBar = createProgressBar(processed, total);
  const line1 = '╔══════════════════════════════════════════════════════════════════════╗';
  const line2 = '║                    FLASHSCORE SCRAPER v2.0                           ║';
  const line3 = `║  ${country} → ${league} ${season}`.padEnd(71, ' ') + '║';
  const line4 = '╠══════════════════════════════════════════════════════════════════════╣';
  const line5 = `║  Progress:  ${progressBar}`.padEnd(71, ' ') + '║';
  const line6 = `║  ✅ Success: ${success}  |  ❌ Failed: ${failed}  |  ⏱️  Avg: ${avgTimeFormatted}`.padEnd(71, ' ') + '║';
  const line7 = `║  📊 Incidents: ✅ ${succeededInc}  |  ❌ ${failedInc}`.padEnd(71, ' ') + '║';
  const line8 = `║  💾 Memory: ${memoryFormatted}  |  🔄 Restarts: ${restarts}`.padEnd(71, ' ') + '║';
  const line9 = `║  💾 Checkpoint: ${checkpointPosition}/${total} (${checkpointCount} saves)`.padEnd(71, ' ') + '║';
  const line10 = `║  ⏱️  Duration: ${duration}  |  📅 ETA: ${etaFormatted}`.padEnd(71, ' ') + '║';
  const line11 = '╚══════════════════════════════════════════════════════════════════════╝';
  
  // Clear console on every update (except first render for context)
  if (!isFirstRender) {
    clearConsole();
  }
  isFirstRender = false;
  
  // Print dashboard
  console.log(line1);
  console.log(line2);
  console.log(line3);
  console.log(line4);
  console.log(line5);
  console.log(line6);
  console.log(line7);
  console.log(line8);
  console.log(line9);
  console.log(line10);
  console.log(line11);
  console.log(''); // Empty line for separation
};

/**
 * Initialize dashboard (call once at start)
 */
export const initializeDashboard = (stats) => {
  isFirstRender = true;
  displayDashboard(stats);
};