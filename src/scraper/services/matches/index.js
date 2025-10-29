import { BASE_URL } from '../../../constants/index.js';
import { openPageAndNavigate, waitAndClick, waitForSelectorSafe, delayBetweenRequests } from '../../index.js';
import { handleFileType } from '../../../files/handle/index.js';
import { normalizeStats, validateStats } from '../../../utils/normalizer/index.js';
import { extractIncidents } from '../incidents/index.js';

// --- Config ---
const MAX_RETRIES = 3;
const PAGE_TIMEOUT = 60000;         // 60s por página

// --- Obtener lista de match IDs ---
export const getMatchIdList = async (browser, leagueSeasonUrl) => {
  const page = await openPageAndNavigate(browser, `${leagueSeasonUrl}/results`);

  console.log(`\nℹ️  Opening results page: ${leagueSeasonUrl}/results`);
  console.log(`⏳ Loading all matches...`);

  // Wait for initial matches to load
  await waitForSelectorSafe(page, '.event__match.event__match--static.event__match--twoLine', 10000);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Click "Show more matches" until all matches are loaded
  let previousCount = 0;
  let clickCount = 0;
  let noChangeCount = 0; // Track how many times count didn't change
  const MAX_CLICKS = 25;
  const MAX_NO_CHANGE = 2; // Stop if count doesn't change 2 times in a row
  
  while (clickCount < MAX_CLICKS) {
    // Count current matches
    const currentCount = await page.evaluate(() => {
      return document.querySelectorAll('.event__match.event__match--static.event__match--twoLine').length;
    });
    
    // Log progress
    if (clickCount === 0) {
      console.log(`📊 Initial matches visible: ${currentCount}`);
    } else {
      console.log(`📊 After click ${clickCount}: ${currentCount} matches visible (+${currentCount - previousCount})`);
    }
    
    // If no new matches loaded, increment counter
    if (currentCount === previousCount && clickCount > 0) {
      noChangeCount++;
      if (noChangeCount >= MAX_NO_CHANGE) {
        console.log(`✅ No new matches loaded after ${MAX_NO_CHANGE} attempts - all matches retrieved!`);
        break;
      }
    } else {
      noChangeCount = 0; // Reset counter if we got new matches
    }
    
    // Try to find and click "Show more matches" button
    try {
      // First, scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find and click the button
      const buttonInfo = await page.evaluate(() => {
        // Try to find the button
        const selectors = [
          'a[data-testid="wcl-buttonLink"]',
          'a.wclButtonLink',
          'a.event__more',
        ];
        
        for (const selector of selectors) {
          const buttons = Array.from(document.querySelectorAll(selector));
          const showMoreButton = buttons.find(btn => {
            const text = (btn.innerText || btn.textContent || '').toLowerCase();
            return text.includes('show more') || 
                   text.includes('load more') ||
                   text.includes('more matches');
          });
          
          if (showMoreButton) {
            // Get button info for debugging
            const rect = showMoreButton.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
            
            // Scroll into view if needed
            if (!isVisible) {
              showMoreButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Click the button
            showMoreButton.click();
            
            return {
              found: true,
              selector: selector,
              text: showMoreButton.innerText,
              visible: isVisible
            };
          }
        }
        return { found: false };
      });
      
      if (!buttonInfo.found) {
        console.log(`ℹ️  "Show more matches" button not found`);
        break;
      }
      
      clickCount++;
      console.log(`🔄 Clicked "Show more matches" (click ${clickCount}/${MAX_CLICKS})`);
      
      // Wait for loading animation - look for loading indicator or just wait
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Wait for the loading animation to finish by checking if new matches appear
      let waitCount = 0;
      const maxWaits = 10; // Wait up to 10 seconds
      while (waitCount < maxWaits) {
        const newCount = await page.evaluate(() => {
          return document.querySelectorAll('.event__match.event__match--static.event__match--twoLine').length;
        });
        
        if (newCount > currentCount) {
          console.log(`✓ New matches loaded (${newCount - currentCount} added)`);
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        waitCount++;
      }
      
      if (waitCount >= maxWaits) {
        console.warn(`⚠️  Timeout waiting for new matches to load`);
      }
      
      // Extra wait to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update previous count
      previousCount = currentCount;
      
    } catch (error) {
      console.warn(`⚠️  Error clicking button: ${error.message}`);
      break;
    }
  }
  
  if (clickCount >= MAX_CLICKS) {
    console.warn(`⚠️  Reached maximum clicks (${MAX_CLICKS})`);
  }

  // Final count and extraction
  const matchIdList = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll('.event__match.event__match--static.event__match--twoLine')
    ).map(el => el?.id?.replace('g_1_', ''));
  });

  console.log(`\n✅ Successfully loaded ${matchIdList.length} match IDs`);
  console.log(`📥 Total "Show more" clicks: ${clickCount}\n`);
  
  await page.close();
  return matchIdList;
};

// --- Extraer datos de un match ---
export const getMatchData = async (browser, matchId, retryCount = 0) => {
  let page;
  try {
    // Silent mode - no initial log
    if (retryCount === 0) {
      await delayBetweenRequests();
    }

    const url = `${BASE_URL}/match/${matchId}/#/match-summary/match-summary`;
    
    // Try to open page
    try {
      page = await openPageAndNavigate(browser, url, 3, false);
      if (!page) {
        throw new Error('openPageAndNavigate returned null/undefined');
      }
    } catch (err) {
      throw new Error(`Navigation failed: ${err.message}`);
    }

    // Validate page loaded correctly
    await new Promise(r => setTimeout(r, 2000));
    
    const pageIsValid = await page.evaluate(() => {
      const hasHome = !!document.querySelector('.duelParticipant__home');
      const hasAway = !!document.querySelector('.duelParticipant__away');
      const hasScore = !!document.querySelector('.detailScore__wrapper');
      return hasHome && hasAway && hasScore;
    });

    if (!pageIsValid) {
      throw new Error('Critical elements not found on page');
    }

    // Privacy overlay - silent
    await handlePrivacyOverlay(page, matchId);

    // Extract data
    let matchData = await extractMatchData(page);
    let information = await extractMatchInformation(page);

    // Extract incidents (only for FINISHED matches)
    let incidents = [];
    if (matchData.status === 'FINISHED') {
      incidents = await extractIncidents(page, matchId);
    }

    // Extract statistics
    let statistics = [];
    
    if (matchData.status === 'FINISHED') {
      try {
        // Click the STATS tab
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

        if (statsTabFound) {
          await new Promise(r => setTimeout(r, 4000));
          
          // Try to expand collapsed sections
          await page.evaluate(() => {
            const expandButtons = document.querySelectorAll('button[aria-expanded="false"], [class*="expand"], [class*="accordion"]');
            expandButtons.forEach(btn => {
              try { btn.click(); } catch (e) {}
            });
          });
          
          await new Promise(r => setTimeout(r, 2000));
          statistics = await extractMatchStatistics(page);
        }
        
        // Fallback to direct URLs if needed
        if (statistics.length < 38) {
          const tabUrls = [
            `${BASE_URL}/match/${matchId}/#/match-summary/match-statistics/0`,
            `${BASE_URL}/match/${matchId}/#/match-summary/match-statistics/1`,
            `${BASE_URL}/match/${matchId}/#/match-summary/match-statistics`
          ];

          for (let i = 0; i < tabUrls.length; i++) {
            try {
              await page.goto(tabUrls[i], { waitUntil: 'networkidle0', timeout: PAGE_TIMEOUT });
              await page.waitForSelector("div[data-testid='wcl-statistics']", { timeout: 5000 });
              await new Promise(r => setTimeout(r, 3000));
              
              await page.evaluate(() => {
                const expandButtons = document.querySelectorAll('button[aria-expanded="false"], [class*="expand"], [class*="accordion"]');
                expandButtons.forEach(btn => {
                  try { btn.click(); } catch (e) {}
                });
              });
              await new Promise(r => setTimeout(r, 2000));
              
              const newStats = await extractMatchStatistics(page);
              
              if (newStats.length >= 38 && newStats.length <= 50) {
                statistics = newStats;
                break;
              } else if (newStats.length > statistics.length) {
                statistics = newStats;
              }
            } catch (err) {
              // Continue to next URL
            }
          }
        }
        
      } catch (err) {
        // Silent - no warning
      }
    }

    await page.close();

    // Normalize and validate statistics
    if (statistics.length > 0) {
      statistics = normalizeStats(statistics);
      
      // Validate in development (optional - can remove in production)
      const validation = validateStats(statistics);
      if (!validation.isValid) {
        console.warn(`⚠️ Stats validation issues for ${matchId}:`, validation.issues);
      }
    }
    
    // Silent success - no log
    return { ...matchData, information, incidents, statistics };
  } catch (error) {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // Ignore
      }
    }
    
    // Only log on final failure
    if (retryCount >= MAX_RETRIES) {
      console.error(`❌ Failed match ${matchId} after ${MAX_RETRIES + 1} attempts: ${error.message}`);
    }
    
    if (retryCount < MAX_RETRIES) {
      const waitTime = Math.min(5000 * (retryCount + 1), 20000);
      await new Promise(res => setTimeout(res, waitTime));
      return getMatchData(browser, matchId, retryCount + 1);
    }
    return null;
  }
};

// --- Helpers ---
const handlePrivacyOverlay = async (page, matchId) => {
  if (!page) return;
  await page.evaluate(() => {
    const overlay = document.querySelector('div#onetrust-consent-sdk, div[class*="privacy"], div[class*="overlay"]');
    if (overlay) {
      overlay.style.display = 'none';
      document.body.style.overflow = 'visible';
      document.body.style.position = 'static';
    }
    document.querySelectorAll('[class*="modal"], [class*="popup"]').forEach(el => el.style.display = 'none');
  });
  await new Promise(r => setTimeout(r, 1000));
};

const extractMatchData = async (page) => {
  if (!page) return {};
  return await page.evaluate(() => ({
    stage: document.querySelector('.tournamentHeader__country > a')?.innerText.trim(),
    date: document.querySelector('.duelParticipant__startTime')?.innerText.trim(),
    status: document.querySelector('.fixedHeaderDuel__detailStatus')?.innerText.trim(),
    home: {
      name: document.querySelector('.duelParticipant__home .participant__participantName.participant__overflow')?.innerText.trim(),
      image: document.querySelector('.duelParticipant__home .participant__image')?.src,
    },
    away: {
      name: document.querySelector('.duelParticipant__away .participant__participantName.participant__overflow')?.innerText.trim(),
      image: document.querySelector('.duelParticipant__away .participant__image')?.src,
    },
    result: {
      home: Array.from(document.querySelectorAll('.detailScore__wrapper span:not(.detailScore__divider)'))?.[0]?.innerText.trim(),
      away: Array.from(document.querySelectorAll('.detailScore__wrapper span:not(.detailScore__divider)'))?.[1]?.innerText.trim(),
      regulationTime: document.querySelector('.detailScore__fullTime')?.innerText.trim().replace(/[\n()]/g, ''),
      penalties: Array.from(document.querySelectorAll('[data-testid="wcl-scores-overline-02"]'))
        .find(el => el.innerText.trim().toLowerCase() === 'penalties')
        ?.nextElementSibling?.innerText?.trim().replace(/\s+/g, ''),
    }
  }));
};

const extractMatchInformation = async (page) => {
  if (!page) return [];
  return await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("div[data-testid='wcl-summaryMatchInformation'] > div"));
    return elements.reduce((acc, el, index) => {
      if (index % 2 === 0) {
        acc.push({
          category: el?.textContent.trim().replace(/\s+/g, ' ').replace(/(^[:\s]+|[:\s]+$|:)/g, ''),
          value: elements[index + 1]?.innerText.trim().replace(/\s+/g, ' ').replace(/(^[:\s]+|[:\s]+$|:)/g, '')
        });
      }
      return acc;
    }, []);
  });
};

const extractMatchStatistics = async (page) => {
  if (!page) return [];
  return await page.evaluate(() => {
    const parseStatValue = (rawValue) => {
      if (!rawValue) return { raw: '', percentage: null, successful: null, total: null };
      const cleanValue = rawValue.replace(/\s+/g, ' ').trim();
      const percentageMatch = cleanValue.match(/^(\d+)%\s*\((\d+)\/(\d+)\)$/);
      if (percentageMatch) {
        return { raw: cleanValue, percentage: parseFloat(percentageMatch[1]), successful: parseInt(percentageMatch[2]), total: parseInt(percentageMatch[3]) };
      }
      const simplePercentageMatch = cleanValue.match(/^(\d+)%$/);
      if (simplePercentageMatch) return { raw: cleanValue, percentage: parseFloat(simplePercentageMatch[1]), successful: null, total: null };
      const numValue = parseFloat(cleanValue);
      return { raw: cleanValue, value: isNaN(numValue) ? cleanValue : numValue, percentage: null, successful: null, total: null };
    };

    const statElements = Array.from(document.querySelectorAll("div[data-testid='wcl-statistics']"));
    return statElements.map(el => {
      const category = el.querySelector("div[data-testid='wcl-statistics-category']")?.innerText.trim();
      const valueElements = Array.from(el.querySelectorAll("div[data-testid='wcl-statistics-value']"));
      let homeRaw = '', awayRaw = '';

      if (valueElements.length >= 2) {
        const homeOptions = [
          valueElements[0]?.querySelector('strong')?.innerText.trim() || '',
          valueElements[0]?.innerText.trim() || '',
          valueElements[0]?.textContent.trim() || ''
        ];
        const awayOptions = [
          valueElements[1]?.querySelector('strong')?.innerText.trim() || '',
          valueElements[1]?.innerText.trim() || '',
          valueElements[1]?.textContent.trim() || ''
        ];
        homeRaw = homeOptions.reduce((longest, current) => current.length > longest.length ? current : longest, '');
        awayRaw = awayOptions.reduce((longest, current) => current.length > longest.length ? current : longest, '');
        if (!homeRaw.includes('(') && valueElements[0]?.title) homeRaw = valueElements[0].title;
        if (!awayRaw.includes('(') && valueElements[1]?.title) awayRaw = valueElements[1].title;
      }

      return { category: category || '', home: parseStatValue(homeRaw), away: parseStatValue(awayRaw) };
    }).filter(stat => stat.category);
  });
};

export { extractMatchData, extractMatchInformation, extractMatchStatistics };