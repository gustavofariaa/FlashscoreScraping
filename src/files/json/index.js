import fs from "fs";
import path from "path";

import { OUTPUT_PATH } from "../../constants/index.js";

export const writeJsonToFile = (data, fileName, asArray) => {
  const preparedData = asArray ? toArray(data) : data;

  const filePath = path.join(OUTPUT_PATH, fileName);
  const fileContent = JSON.stringify(preparedData, null, 2);

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileContent, "utf-8");
  } catch (error) {
    throw Error(`❌ Failed to create directories or write the JSON file`);
  }
};

const toArray = (data) =>
  Object.entries(data).map(([matchId, matchData]) => ({
    matchId,
    ...structuredClone(matchData),
  }));
