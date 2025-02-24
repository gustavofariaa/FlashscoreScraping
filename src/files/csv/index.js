import fs from 'fs';
import path from 'path';
import jsonexport from 'jsonexport';

export const writeCsvToFile = (data, outputPath, fileName) => {
  const filePath = path.join(outputPath, `${fileName}.csv`);

  const csvData = convertDataToCsv(data);

  jsonexport(csvData, (error, fileContent) => {
    if (error) throw error;

    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, fileContent);
    } catch (error) {
      console.error(`Error creating directories or writing to CSV file:`, error);
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
