/**
 * Incidents Extraction Module
 * Extracts match incidents (goals, cards, substitutions, VAR, penalties)
 */

/**
 * Helper function to clean text - remove parentheses
 */
const cleanText = (text) => {
  if (!text) return null;
  return text.replace(/[()]/g, '').trim();
};

/**
 * Extract incidents from match summary page
 * @param {Page} page - Puppeteer page object
 * @param {string} matchId - Match ID for logging
 * @returns {Array} Array of incident objects
 */
export const extractIncidents = async (page, matchId) => {
  try {
    // Strategy 1: Try primary selector with timeout
    await page.waitForSelector('div.smv__participantRow', { timeout: 10000 });
    
    // Extract incidents
    const incidents = await page.evaluate((cleanTextStr) => {
      // Re-create cleanText function inside browser context
      const cleanText = new Function('return ' + cleanTextStr)();
      
      const rows = Array.from(document.querySelectorAll('div.smv__participantRow'));
      
      return rows.map((row, index) => {
        // Detect half based on minute
        let half = 'Unknown';
        const minute = row.querySelector('.smv__timeBox')?.innerText?.trim() || '';
        const minuteNum = parseInt(minute.split('+')[0].replace(/[^0-9]/g, ''));
        
        if (!isNaN(minuteNum)) {
          if (minuteNum >= 1 && minuteNum <= 45) {
            half = '1st Half';
          } else if (minuteNum >= 46 && minuteNum <= 90) {
            half = '2nd Half';
          } else if (minuteNum > 90) {
            half = 'Extra Time';
          }
        }
        
        // Detect type of incident
        let type = 'Unknown';
        
        // Check for specific incident types
        const hasVarIcon = row.querySelector('svg.var') ||
                           row.querySelector('svg[class*="var"]') ||
                           row.querySelector('.smv__incidentIcon svg use[href*="var"]') ||
                           row.querySelector('.smv__incidentIcon svg use[*|href*="var"]');
        const hasPenaltyMissedIcon = row.querySelector('svg[data-testid="wcl-icon-incidents-penalty-missed"]');
        const hasOwnGoalIcon = row.querySelector('svg.footballOwnGoal-ico') ||
                               row.querySelector('svg[class*="ownGoal"]') ||
                               row.querySelector('svg[class*="OwnGoal"]');
        const hasGoalIcon = row.querySelector('svg[class*="goal"]') && !hasOwnGoalIcon ||
                            row.querySelector('.smv__incidentIcon svg use[href*="goal"]') ||
                            row.querySelector('.smv__incidentIcon svg use[*|href*="goal"]');
        const hasSubIcon = row.querySelector('svg.substitution, svg[class*="substitution"]') || 
                           row.querySelector('.smv__incidentIcon svg use[href*="substitution"]') ||
                           row.querySelector('.smv__incidentIcon svg use[*|href*="substitution"]');
        const hasCardIcon = row.querySelector('svg.card-ico, svg[class*="Card"]') ||
                            row.querySelector('.smv__incidentIcon svg use[href*="card"]') ||
                            row.querySelector('.smv__incidentIcon svg use[*|href*="card"]');
        
        // Check text content for VAR, Own Goal, and Penalty Missed
        const incidentText = (row.innerText || '').toLowerCase();
        const hasVarText = incidentText.indexOf('goal disallowed') !== -1 || 
                           incidentText.indexOf('disallowed') !== -1 ||
                           incidentText.indexOf('var') !== -1;
        const hasOwnGoalText = incidentText.indexOf('own goal') !== -1;
        const hasPenaltyMissedText = incidentText.indexOf('penalty missed') !== -1;
        
        // Priority order: VAR > Penalty Missed > Own Goal > Goal > Sub > Card
        if (hasVarIcon || hasVarText) {
          type = 'VAR - Disallowed';
        } else if (hasPenaltyMissedIcon || hasPenaltyMissedText) {
          type = 'Penalty Missed';
        } else if (hasOwnGoalIcon || hasOwnGoalText) {
          type = 'Own Goal';
        } else if (hasGoalIcon) {
          type = 'Goal';
        } else if (hasSubIcon) {
          type = 'Substitution';
        } else if (hasCardIcon) {
          type = 'Card';
        }
        
        // Additional fallback by content
        if (type === 'Unknown') {
          const hasScore = row.querySelector('.smv__incidentHomeScore, .smv__incidentAwayScore');
          const hasSubDown = row.querySelector('.smv__subDown');
          
          if (hasScore) {
            type = 'Goal';
          } else if (hasSubDown) {
            type = 'Substitution';
          }
        }
        
        // Detect card type if event is Card
        let cardType = null;
        const cardEl = row.querySelector('svg.card-ico') || 
                       row.querySelector('svg[class*="Card"]') ||
                       row.querySelector('.smv__incidentIcon svg');
        
        if (cardEl) {
          const classList = cardEl.className.baseVal || cardEl.getAttribute('class') || '';
          const useEl = cardEl.querySelector('use');
          const titleEl = cardEl.querySelector('title');
          
          let titleText = '';
          if (titleEl) {
            titleText = titleEl.textContent || titleEl.innerText || titleEl.innerHTML || '';
          }
          
          let useHref = '';
          if (useEl) {
            try {
              useHref = useEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
            } catch (e) {
              // Fallback if getAttributeNS fails
            }
            if (!useHref) {
              useHref = useEl.getAttribute('xlink:href') || '';
            }
            if (!useHref) {
              useHref = useEl.getAttribute('href') || '';
            }
          }
          
          // Check for red-yellow card (second yellow = red)
          if (titleText.indexOf('Yellow card / Red card') !== -1) {
            cardType = 'Yellow/Red';
            type = 'Card';
          } else if (useHref.indexOf('red-yellow-card') !== -1 || classList.indexOf('redYellowCard') !== -1) {
            cardType = 'Yellow/Red';
            type = 'Card';
          } else if (titleText.indexOf('Yellow card') !== -1 && titleText.indexOf('Red card') === -1) {
            cardType = 'Yellow';
            type = 'Card';
          } else if (useHref.indexOf('yellow-card') !== -1 || classList.indexOf('yellowCard') !== -1 || classList.indexOf('yellow') !== -1) {
            cardType = 'Yellow';
            type = 'Card';
          } else if (titleText.indexOf('Red card') !== -1 && titleText.indexOf('Yellow card') === -1) {
            cardType = 'Red';
            type = 'Card';
          } else if (useHref.indexOf('red-card') !== -1 || classList.indexOf('redCard') !== -1 || classList.indexOf('red') !== -1) {
            cardType = 'Red';
            type = 'Card';
          }
        }
        
        const team = row.classList.contains('smv__homeParticipant') ? 'Home' : 'Away';
        let player = row.querySelector('.smv__playerName')?.innerText?.trim() || null;
        let assist = row.querySelector('.smv__assist')?.innerText?.trim() || null;
        const outPlayer = row.querySelector('.smv__subDown')?.innerText?.trim() || null;
        const score = row.querySelector('.smv__incidentHomeScore, .smv__incidentAwayScore')?.innerText?.trim() || null;
        let detail = row.querySelector('.smv__subIncident')?.innerText?.trim() || null;
        
        // FIX: For VAR disallowed goals, player name is in assist column - move it to player column
        if (type === 'VAR - Disallowed' && !player && assist) {
          player = assist;
          assist = null;
        }
        
        // FIX: If assist contains "Not on pitch", move it to detail
        if (assist && assist.toLowerCase().indexOf('not on pitch') !== -1) {
          detail = cleanText(assist);
          assist = null;
        }
        
        // Clean all text fields - remove parentheses
        player = cleanText(player);
        assist = cleanText(assist);
        detail = cleanText(detail);
        
        return { 
          id: index + 1,
          half, 
          minute, 
          team, 
          type,
          cardType,
          player, 
          assist,
          outPlayer,
          score,
          detail
        };
      });
    }, cleanText.toString());
    
    return incidents;
    
  } catch (firstError) {
    // Strategy 2: Try alternative selector
    try {
      await page.waitForSelector('.smv__incident', { timeout: 5000 });
      
      // Try extraction with alternative logic if needed
      const incidents = await page.evaluate(() => {
        const incidentElements = document.querySelectorAll('.smv__incident');
        if (incidentElements.length === 0) return [];
        
        // Basic extraction fallback
        return Array.from(incidentElements).map((el, index) => ({
          id: index + 1,
          half: 'Unknown',
          minute: el.querySelector('[class*="time"]')?.innerText?.trim() || '',
          team: 'Unknown',
          type: 'Unknown',
          cardType: null,
          player: null,
          assist: null,
          outPlayer: null,
          score: null,
          detail: null
        }));
      });
      
      if (incidents.length > 0) {
        console.warn(`⚠️ Used fallback selector for incidents (${matchId})`);
      }
      
      return incidents;
      
    } catch (secondError) {
      // Strategy 3: Check if incidents section exists at all
      const hasIncidentSection = await page.evaluate(() => {
        return !!document.querySelector('.smv, [class*="incident"], [class*="participantRow"]');
      });
      
      if (hasIncidentSection) {
        console.warn(`⚠️ Incidents section exists but couldn't extract for ${matchId}`);
      }
      
      // Return empty array (don't crash scraper)
      return [];
    }
  }
};