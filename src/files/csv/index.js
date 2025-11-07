import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import jsonexport from "jsonexport";

import { OUTPUT_PATH } from "../../constants/index.js";

export const writeCsvToFile = (data, fileName) => {
  const filePath = path.join(OUTPUT_PATH, fileName);

  const csvData = convertDataToCsv(data);

  jsonexport(csvData, (error, fileContent) => {
    if (error) throw error;

    try {
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, fileContent);
    } catch (error) {
      throw Error(`❌ Failed to create directories or write the CSV file`);
    }
  });
};

const convertDataToCsv = (data) =>
  Object.keys(data).map((matchId) => {
    const { stage, status, date, home, away, result, information, statistics } =
      data[matchId];
    const informationObject = {};
    const statisticsObject = {};

    information.forEach((info) => {
      informationObject[info.category.toLowerCase().replace(/ /g, "_")] =
        info.value;
    });

    statistics.forEach((stat) => {
      statisticsObject[stat.category.toLowerCase().replace(/ /g, "_")] = {
        home: stat.homeValue,
        away: stat.awayValue,
      };
    });

    return {
      matchId,
      stage,
      status,
      date,
      home,
      away,
      result,
      information: { ...informationObject },
      statistics: { ...statisticsObject },
    };
  });
