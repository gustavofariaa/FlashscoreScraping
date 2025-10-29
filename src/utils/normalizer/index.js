/**
 * Normalizer Module
 * Handles normalization of scraped data for consistency
 * Currently supports: Statistics normalization
 * Future: Incidents normalization
 */

// Standard statistics ordered by section (35 stats total)
export const STANDARD_STATS_ORDERED = {
  'Shots': [
    'Expected Goals (xG)',
    'xG on target (xGOT)',
    'Total shots',
    'Shots on target',
    'Shots off target',
    'Blocked Shots',
    'Shots inside the Box',
    'Shots outside the Box',
    'Hit the Woodwork',
    'Headed Goals'
  ],
  
  'Attack': [
    'Big Chances',
    'Corner Kicks',
    'Touches in opposition box',
    'Accurate through passes',
    'Offsides',
    'Free Kicks'
  ],
  
  'Passes': [
    'Ball Possession',
    'Passes',
    'Long passes',
    'Passes in final third',
    'Crosses',
    'Expected assists (xA)',
    'Throw-ins'
  ],
  
  'Defense': [
    'Yellow Cards',
    'Red Cards',
    'Fouls',
    'Tackles',
    'Duels won',
    'Clearances',
    'Interceptions',
    'Errors leading to shot',
    'Errors leading to goal'
  ],
  
  'Goalkeeping': [
    'Goalkeeper Saves',
    'xGOT faced',
    'Goals prevented'
  ]
};

// Flatten for easy iteration
const STANDARD_STATS_FLAT = Object.entries(STANDARD_STATS_ORDERED)
  .flatMap(([section, stats]) => stats.map(name => ({ name, section })));

/**
 * Normalize stat name (remove special chars, lowercase, trim)
 */
const normalizeStatName = (name) => {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')  // Remove parentheses
    .replace(/\s+/g, ' ')  // Normalize spaces
    .trim();
};

/**
 * Fuzzy match stat names to handle variations
 */
const fuzzyMatchStat = (extractedName, standardName) => {
  const extracted = normalizeStatName(extractedName);
  const standard = normalizeStatName(standardName);
  
  // Exact match
  if (extracted === standard) return true;
  
  // Common variations mapping (explicit matches only)
  const variations = {
    'expected goals xg': ['xg', 'expected goals'],
    'xg on target xgot': ['xgot', 'xg on target'],
    'expected assists xa': ['xa', 'expected assists'],
    'xgot faced': ['xg on target faced'],
    'offsides': ['offside'],
    'throw-ins': ['throw ins', 'throwins'],
    'touches in opposition box': ['touches opposition box', 'touches in opp box'],
    'shots inside the box': ['shots inside box'],
    'shots outside the box': ['shots outside box'],
    'hit the woodwork': ['woodwork', 'hit woodwork'],
    'errors leading to shot': ['error leading to shot'],
    'errors leading to goal': ['error leading to goal'],
    'goalkeeper saves': ['saves', 'gk saves', 'goalkeeper save'],
    'goals prevented': ['goal prevented']
  };
  
  // Check if extracted matches any variation of standard
  const standardVariations = variations[standard] || [];
  if (standardVariations.some(v => v === extracted)) {
    return true;
  }
  
  // Check if standard matches any variation of extracted
  const extractedKey = Object.keys(variations).find(k => k === extracted);
  if (extractedKey && variations[extractedKey].some(v => v === standard)) {
    return true;
  }
  
  // Special handling for stats that should NOT partial match
  const noPartialMatch = [
    'passes',
    'long passes',
    'passes in final third',
    'accurate through passes',
    'big chances',
    'corner kicks',
    'total shots',
    'shots on target',
    'shots off target'
  ];
  
  // If either stat is in the no-partial-match list, require exact or variation match only
  if (noPartialMatch.includes(standard) || noPartialMatch.includes(extracted)) {
    return false; // Already tried exact and variations above
  }
  
  // For other stats, allow partial match only if significant overlap
  // Must be at least 70% of the shorter string length
  const minLength = Math.min(extracted.length, standard.length);
  const maxLength = Math.max(extracted.length, standard.length);
  
  if (minLength < 5) return false; // Too short for partial matching
  
  // Check if one contains the other with significant overlap
  if (extracted.includes(standard) || standard.includes(extracted)) {
    const overlapRatio = minLength / maxLength;
    return overlapRatio >= 0.7; // 70% similarity threshold
  }
  
  return false;
};

/**
 * Deduplicate stats - keep last occurrence
 */
export const deduplicateStats = (stats) => {
  const grouped = {};
  
  // Group by normalized category name
  stats.forEach(stat => {
    const normalizedName = normalizeStatName(stat.category);
    if (!grouped[normalizedName]) {
      grouped[normalizedName] = [];
    }
    grouped[normalizedName].push(stat);
  });
  
  // Keep LAST occurrence of each (most detailed)
  return Object.values(grouped).map(group => group[group.length - 1]);
};

/**
 * Create empty stat with zeros
 */
const createEmptyStat = (statName, section) => {
  return {
    category: statName,
    section: section,
    home: { 
      raw: '0', 
      value: 0, 
      percentage: null, 
      successful: null, 
      total: null 
    },
    away: { 
      raw: '0', 
      value: 0, 
      percentage: null, 
      successful: null, 
      total: null 
    }
  };
};

/**
 * Normalize and fill missing stats
 */
export const normalizeStats = (extractedStats) => {
  // First deduplicate
  const deduplicated = deduplicateStats(extractedStats);
  
  const result = [];
  
  // Go through standard stats in order
  STANDARD_STATS_FLAT.forEach(({ name: statName, section }) => {
    // Try to find this stat in extracted data using fuzzy matching
    const found = deduplicated.find(stat => 
      fuzzyMatchStat(stat.category, statName)
    );
    
    if (found) {
      // Use extracted value, add section metadata
      result.push({
        ...found,
        section: section,
        category: statName // Standardize the name
      });
    } else {
      // Stat missing - fill with zeros
      result.push(createEmptyStat(statName, section));
    }
  });
  
  return result;
};

/**
 * Get stats grouped by section
 */
export const groupStatsBySection = (normalizedStats) => {
  const grouped = {};
  
  normalizedStats.forEach(stat => {
    if (!grouped[stat.section]) {
      grouped[stat.section] = [];
    }
    grouped[stat.section].push(stat);
  });
  
  return grouped;
};

/**
 * Validate stats structure
 */
export const validateStats = (stats) => {
  const issues = [];
  
  // Check count
  if (stats.length !== 35) {
    issues.push(`Expected 35 stats, got ${stats.length}`);
  }
  
  // Check for missing standard stats
  STANDARD_STATS_FLAT.forEach(({ name }) => {
    const found = stats.find(s => s.category === name);
    if (!found) {
      issues.push(`Missing stat: ${name}`);
    }
  });
  
  // Check for duplicate names (shouldn't happen after normalization)
  const names = stats.map(s => s.category);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length > 0) {
    issues.push(`Duplicate stats found: ${duplicates.join(', ')}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
};