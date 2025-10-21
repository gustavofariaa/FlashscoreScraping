/**
 * Dashboard Display for Scraper
 */

const DASHBOARD_LINES = 9; // Number of lines the dashboard uses

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
const createProgressBar = (current, total, width = 20) => {
  const percentage = Math.floor((current / total) * 100);
  const filled = Math.floor((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar}  ${percentage}% (${current}/${total})`;
};

// Track if this is the first render
let isFirstRender = true;

/**
 * Clear dashboard from terminal (move cursor up and clear)
 */
export const clearDashboard = () => {
  if (isFirstRender) {
    return; // Don't clear on first render
  }
  
  // Move cursor up and clear lines
  for (let i = 0; i < DASHBOARD_LINES; i++) {
    process.stdout.write('\x1B[1A'); // Move up one line
    process.stdout.write('\x1B[2K'); // Clear line
  }
};

/**
 * Display dashboard
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
    avgTime = 0,
    memory = 0,
    restarts = 0,
    startTime = Date.now(),
    eta = 0
  } = stats;
  
  // Calculate percentage and duration
  const percentage = total > 0 ? Math.floor((processed / total) * 100) : 0;
  const duration = formatDuration(Date.now() - startTime);
  const etaFormatted = formatDuration(eta);
  const memoryFormatted = formatMemory(memory);
  const avgTimeFormatted = avgTime > 0 ? `${avgTime.toFixed(1)}s` : 'N/A';
  
  // Build the dashboard
  const lines = [
    '╔════════════════════════════════════════════════════════╗',
    '║            FLASHSCORE SCRAPER v2.0                     ║',
    `║  ${country} → ${league} ${season}`.padEnd(57) + '║',
    '╠════════════════════════════════════════════════════════╣',
    `║  Progress:  ${createProgressBar(processed, total)}`.padEnd(57) + '║',
    `║  ✅ Success: ${success}  |  ❌ Failed: ${failed}  |  ⏱️  Avg: ${avgTimeFormatted}`.padEnd(57) + '║',
    `║  💾 Memory:  ${memoryFormatted}  |  🔄 Restarts: ${restarts}`.padEnd(57) + '║',
    `║  ⏱️  Duration: ${duration}  |  📅 ETA: ${etaFormatted}`.padEnd(57) + '║',
    '╚════════════════════════════════════════════════════════╝'
  ];
  
  // Clear previous dashboard (except on first render)
  clearDashboard();
  isFirstRender = false;
  
  // Print dashboard
  console.log(lines.join('\n'));
};

/**
 * Initialize dashboard (call once at start)
 */
export const initializeDashboard = (stats) => {
  isFirstRender = true;
  displayDashboard(stats);
};