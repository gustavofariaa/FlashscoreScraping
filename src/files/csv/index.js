import fs from 'fs';
import path from 'path';
import jsonexport from 'jsonexport';
import { formatMatchData } from '../../utils/format/index.js';

export const writeCsvToFile = (data, outputPath, fileName) => {
  const filePath = path.join(outputPath, `${fileName}.csv`);
  const csvData = convertDataToCsv(data);
  
  jsonexport(csvData, (error, fileContent) => {
    if (error) throw error;
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, fileContent);
      console.log(`✅ CSV file saved with optimized structure: ${csvData.length} matches`);
    } catch (error) {
      console.error(`Error creating directories or writing to CSV file:`, error);
    }
  });
};

const convertDataToCsv = (data) => {
  // Transform data using format utility
  const matches = Object.entries(data).map(([matchId, matchData]) => 
    formatMatchData(matchId, matchData)
  );
  
  return matches.map((match) => {
    const { 
      matchId, 
      country, 
      league, 
      season, 
      seasonStartYear, 
      seasonEndYear,
      date, 
      status, 
      homeTeamId,
      homeTeamName, 
      homeTeamImage,
      homeGoals,
      awayTeamId,
      awayTeamName, 
      awayTeamImage,
      awayGoals,
      referee,
      venue,
      capacity,
      attendance,
      regulationTime,
      penalties,
      statistics 
    } = match;
    
    const statisticsObject = {};
    
    // Handle statistics (could be array or object with periods)
    let statsArray = [];
    if (Array.isArray(statistics)) {
      // Single period (fulltime only)
      statsArray = statistics;
    } else if (statistics && statistics.fullTime) {
      // All periods mode - use fullTime stats for CSV
      statsArray = statistics.fullTime;
    }
    
    // Convert statistics to flat object
    statsArray.forEach((stat) => {
      const statKey = stat.category.toLowerCase().replace(/ /g, '_').replace(/[()]/g, '');
      
      // Include home and away values
      if (stat.home && stat.home.value !== undefined) {
        statisticsObject[`${statKey}_home`] = stat.home.value;
      }
      if (stat.away && stat.away.value !== undefined) {
        statisticsObject[`${statKey}_away`] = stat.away.value;
      }
      
      // Include percentages if present
      if (stat.home && stat.home.percentage !== undefined) {
        statisticsObject[`${statKey}_home_pct`] = stat.home.percentage;
      }
      if (stat.away && stat.away.percentage !== undefined) {
        statisticsObject[`${statKey}_away_pct`] = stat.away.percentage;
      }
    });
    
    return {
      matchId,
      country,
      league,
      season,
      seasonStartYear,
      seasonEndYear,
      date,
      status,
      homeTeamId,
      homeTeamName,
      homeGoals,
      awayTeamId,
      awayTeamName,
      awayGoals,
      referee,
      venue,
      capacity,
      attendance,
      regulationTime,
      penalties,
      ...statisticsObject
    };
  });
};