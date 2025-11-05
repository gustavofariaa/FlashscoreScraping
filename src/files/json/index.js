import fs from 'fs';
import path from 'path';
import { formatMatchData } from '../../utils/format/index.js';

export const writeJsonToFile = (data, outputPath, fileName) => {
  const filePath = path.join(outputPath, `${fileName}.json`);
  
  try {
    // Transform data structure from { "matchId": {...} } to { matches: [{matchId: "...", ...}] }
    const transformedData = {
      matches: Object.entries(data).map(([matchId, matchData]) => 
        formatMatchData(matchId, matchData)
      ),
      metadata: {
        totalMatches: Object.keys(data).length,
        exportedAt: new Date().toISOString()
      }
    };
    
    const fileContent = JSON.stringify(transformedData, null, 2);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileContent);
    
    console.log(`✅ JSON file saved with optimized structure: ${transformedData.matches.length} matches`);
  } catch (error) {
    console.error(`Error creating directories or writing to JSON file:`, error);
  }
};