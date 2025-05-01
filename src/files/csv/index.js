import fs from 'fs';
import path from 'path';
import jsonexport from 'jsonexport';

import { OUTPUT_PATH } from '../../constants/index.js';

export const writeCsvToFile = (data, fileName) => {
  const filePath = path.join(OUTPUT_PATH, fileName);

  const csvData = convertDataToCsv(data);

  jsonexport(csvData, (error, fileContent) => {
    if (error) throw error;

    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, fileContent);
    } catch (error) {
      console.error('❌ ERROR: Failed to create directories or write to CSV file.\n');
      process.exit(1);
    }
  });
};

const convertDataToCsv = (data) =>
  Object.keys(data).map((matchId) => {
    const { stage, date, status, home, away, result, information, statistics } = data[matchId];
    const informationObject = {};
    const statisticsObject = {};

    information.forEach((info) => {
      informationObject[info.category.toLowerCase().replace(/ /g, '_')] = info.value;
    });

    statistics.forEach((stat) => {
      statisticsObject[stat.category.toLowerCase().replace(/ /g, '_')] = {
        home: stat.homeValue,
        away: stat.awayValue,
      };
    });

    return { matchId, stage, status, date, home, away, result, ...informationObject, ...statisticsObject };
  });
