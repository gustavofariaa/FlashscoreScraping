/**
 * Format Utility Module
 * Handles data formatting and transformation for database-ready structure
 */

/**
 * Parse string to integer
 * @param {string|number} value - Value to parse
 * @returns {number|null} Parsed integer or null
 */
export const parseInteger = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  if (typeof value === 'number') {
    return Math.floor(value);
  }
  
  // Remove spaces and parse
  const cleaned = String(value).replace(/\s/g, '');
  const parsed = parseInt(cleaned, 10);
  
  return isNaN(parsed) ? null : parsed;
};

/**
 * Parse minute string to structured object
 * Examples: 
 *   "16'" → {minute: 16, minuteDisplay: "16'", isStoppageTime: false, stoppageMinute: null}
 *   "90+3'" → {minute: 90, minuteDisplay: "90+3'", isStoppageTime: true, stoppageMinute: 3}
 * 
 * @param {string} minuteStr - Minute string (e.g., "16'" or "90+3'")
 * @returns {Object} Parsed minute object
 */
export const parseMinute = (minuteStr) => {
  if (!minuteStr || typeof minuteStr !== 'string') {
    return {
      minute: null,
      minuteDisplay: null,
      isStoppageTime: false,
      stoppageMinute: null
    };
  }
  
  const cleaned = minuteStr.replace("'", '').trim();
  
  // Check for stoppage time (e.g., "90+3")
  if (cleaned.includes('+')) {
    const parts = cleaned.split('+');
    const minute = parseInteger(parts[0]);
    const stoppage = parseInteger(parts[1]);
    
    return {
      minute: minute,
      minuteDisplay: minuteStr,
      isStoppageTime: true,
      stoppageMinute: stoppage
    };
  }
  
  // Regular minute
  return {
    minute: parseInteger(cleaned),
    minuteDisplay: minuteStr,
    isStoppageTime: false,
    stoppageMinute: null
  };
};

/**
 * Parse score string to structured object
 * Example: "0 - 1" → {home: 0, away: 1}
 * 
 * @param {string} scoreStr - Score string (e.g., "0 - 1")
 * @returns {Object|null} Parsed score object or null
 */
export const parseScore = (scoreStr) => {
  if (!scoreStr || typeof scoreStr !== 'string') {
    return null;
  }
  
  const parts = scoreStr.split('-').map(s => s.trim());
  
  if (parts.length !== 2) {
    return null;
  }
  
  const home = parseInteger(parts[0]);
  const away = parseInteger(parts[1]);
  
  if (home === null || away === null) {
    return null;
  }
  
  return { home, away };
};

/**
 * Flatten information array to direct properties
 * Example: 
 *   [{category: "Referee", value: "Smith"}, {category: "Venue", value: "Stadium"}]
 *   → {referee: "Smith", venue: "Stadium"}
 * 
 * @param {Array} infoArray - Array of {category, value} objects
 * @returns {Object} Flattened object with direct properties
 */
export const flattenInfo = (infoArray) => {
  if (!Array.isArray(infoArray)) {
    return {};
  }
  
  const result = {};
  
  infoArray.forEach(item => {
    if (!item || !item.category) return;
    
    const category = item.category.toLowerCase().trim();
    const value = item.value;
    
    // Map categories to property names
    if (category === 'referee') {
      result.referee = value;
    } else if (category === 'venue') {
      result.venue = value;
    } else if (category === 'capacity') {
      result.capacity = parseInteger(value);
    } else if (category === 'attendance') {
      result.attendance = parseInteger(value);
    } else {
      // For any other category, use lowercase key
      const key = category.replace(/\s+/g, '_');
      result[key] = value;
    }
  });
  
  return result;
};

/**
 * Remove null and undefined fields from object (recursively)
 * This reduces JSON file size and makes data cleaner
 * 
 * @param {Object|Array} obj - Object or array to clean
 * @returns {Object|Array} Object with null/undefined fields removed
 */
export const removeNulls = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj
      .map(item => removeNulls(item))
      .filter(item => item !== null && item !== undefined);
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const cleaned = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip null and undefined
      if (value === null || value === undefined) {
        continue;
      }
      
      // Recursively clean nested objects/arrays
      if (typeof value === 'object') {
        const cleanedValue = removeNulls(value);
        // Only include if not empty object/array
        if (Array.isArray(cleanedValue)) {
          if (cleanedValue.length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else if (Object.keys(cleanedValue).length > 0) {
          cleaned[key] = cleanedValue;
        }
      } else {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }
  
  // Primitive values
  return obj;
};

/**
 * Generate URL-friendly slug from string
 * Example: "FC Barcelona" → "fc_barcelona"
 * 
 * @param {string} text - Text to slugify
 * @returns {string|null} Slug or null
 */
export const generateSlug = (text) => {
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '_') // Replace spaces/dashes with underscore
    .replace(/^_+|_+$/g, '');  // Remove leading/trailing underscores
};

/**
 * Format match result object
 * Converts string goals to integers and cleans up structure
 * 
 * @param {Object} result - Result object from scraper
 * @returns {Object} Formatted result
 */
export const formatResult = (result) => {
  if (!result) {
    return {
      homeGoals: null,
      awayGoals: null
    };
  }
  
  const formatted = {
    homeGoals: parseInteger(result.home),
    awayGoals: parseInteger(result.away)
  };
  
  // Add optional fields only if present
  if (result.regulationTime) {
    formatted.regulationTime = result.regulationTime;
  }
  
  if (result.penalties) {
    formatted.penalties = result.penalties;
  }
  
  return removeNulls(formatted);
};

/**
 * Format incident object
 * Parses minute and score to proper types
 * 
 * @param {Object} incident - Incident object from scraper
 * @param {Object} matchInfo - Match info for team linking
 * @returns {Object} Formatted incident
 */
export const formatIncident = (incident, matchInfo = {}) => {
  if (!incident) return null;
  
  // Parse minute
  const minuteData = parseMinute(incident.minute);
  
  // Parse score if present
  const scoreData = parseScore(incident.score);
  
  // Determine team info
  const isHomeTeam = incident.team?.toLowerCase() === 'home';
  const teamName = isHomeTeam ? matchInfo.homeTeamName : matchInfo.awayTeamName;
  const teamId = isHomeTeam ? matchInfo.homeTeamId : matchInfo.awayTeamId;
  
  const formatted = {
    id: incident.id,
    half: incident.half,
    ...minuteData, // minute, minuteDisplay, isStoppageTime, stoppageMinute
    teamId: teamId,
    teamName: teamName,
    teamType: isHomeTeam ? 'home' : 'away',
    type: incident.type,
    cardType: incident.cardType,
    player: incident.player,
    assist: incident.assist,
    outPlayer: incident.outPlayer,
    detail: incident.detail
  };
  
  // Add score after incident if available
  if (scoreData) {
    formatted.homeGoalsAfter = scoreData.home;
    formatted.awayGoalsAfter = scoreData.away;
  }
  
  return removeNulls(formatted);
};

/**
 * Format statistics object
 * Removes "raw" field and cleans up structure
 * 
 * @param {Object} stat - Statistics object from scraper
 * @returns {Object} Formatted statistic
 */
export const formatStatistic = (stat) => {
  if (!stat) return null;
  
  const formatTeamStat = (teamData) => {
    if (!teamData) return null;
    
    const formatted = {};
    
    // Don't include "raw" field
    if (teamData.value !== undefined && teamData.value !== null) {
      formatted.value = teamData.value;
    }
    
    if (teamData.percentage !== undefined && teamData.percentage !== null) {
      formatted.percentage = teamData.percentage;
    }
    
    if (teamData.successful !== undefined && teamData.successful !== null) {
      formatted.successful = teamData.successful;
    }
    
    if (teamData.total !== undefined && teamData.total !== null) {
      formatted.total = teamData.total;
    }
    
    return Object.keys(formatted).length > 0 ? formatted : null;
  };
  
  const formatted = {
    category: stat.category,
    section: stat.section,
    home: formatTeamStat(stat.home),
    away: formatTeamStat(stat.away)
  };
  
  return removeNulls(formatted);
};

/**
 * Format complete match data object
 * Applies all formatting transformations
 * 
 * @param {string} matchId - Match ID
 * @param {Object} matchData - Raw match data from scraper
 * @returns {Object} Fully formatted match object
 */
export const formatMatchData = (matchId, matchData) => {
  if (!matchData) return null;
  
  // Generate team IDs
  const homeTeamId = generateSlug(matchData.home?.name);
  const awayTeamId = generateSlug(matchData.away?.name);
  
  // Flatten information array
  const flatInfo = flattenInfo(matchData.information);
  
  // Format result
  const formattedResult = formatResult(matchData.result);
  
  // Build base match object
  const formatted = {
    matchId: matchId,
    country: matchData.country,
    league: matchData.league,
    season: matchData.season,
    seasonStartYear: matchData.seasonStartYear,
    seasonEndYear: matchData.seasonEndYear,
    date: matchData.date,
    status: matchData.status,
    
    // Home team
    homeTeamId: homeTeamId,
    homeTeamName: matchData.home?.name,
    homeTeamImage: matchData.home?.image,
    homeGoals: formattedResult.homeGoals,
    
    // Away team
    awayTeamId: awayTeamId,
    awayTeamName: matchData.away?.name,
    awayTeamImage: matchData.away?.image,
    awayGoals: formattedResult.awayGoals,
    
    // Flattened information
    ...flatInfo,
    
    // Optional result fields
    ...(formattedResult.regulationTime && { regulationTime: formattedResult.regulationTime }),
    ...(formattedResult.penalties && { penalties: formattedResult.penalties })
  };
  
  // Format incidents if present
  if (matchData.incidents && Array.isArray(matchData.incidents)) {
    formatted.incidents = matchData.incidents
      .map(inc => formatIncident(inc, {
        homeTeamName: matchData.home?.name,
        awayTeamName: matchData.away?.name,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId
      }))
      .filter(inc => inc !== null);
  }
  
  // Format statistics if present
  if (matchData.statistics) {
    // Handle different period structures
    if (matchData.statistics.fullTime) {
      // All periods mode
      formatted.statistics = {};
      
      if (Array.isArray(matchData.statistics.fullTime)) {
        formatted.statistics.fullTime = matchData.statistics.fullTime
          .map(stat => formatStatistic(stat))
          .filter(stat => stat !== null);
      }
      
      if (Array.isArray(matchData.statistics.firstHalf)) {
        formatted.statistics.firstHalf = matchData.statistics.firstHalf
          .map(stat => formatStatistic(stat))
          .filter(stat => stat !== null);
      }
      
      if (Array.isArray(matchData.statistics.secondHalf)) {
        formatted.statistics.secondHalf = matchData.statistics.secondHalf
          .map(stat => formatStatistic(stat))
          .filter(stat => stat !== null);
      }
    } else if (Array.isArray(matchData.statistics)) {
      // Single period mode (fulltime only)
      formatted.statistics = matchData.statistics
        .map(stat => formatStatistic(stat))
        .filter(stat => stat !== null);
    }
  }
  
  return removeNulls(formatted);
};