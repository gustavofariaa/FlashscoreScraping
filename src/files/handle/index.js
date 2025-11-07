import { readFileSync, existsSync } from "fs";
import path from "path";

import { FileTypes } from "../../constants/index.js";
import { writeJsonToFile } from "../../files/json/index.js";
import { writeCsvToFile } from "../../files/csv/index.js";
import { OUTPUT_PATH } from "../../constants/index.js";

export const writeDataToFile = (data, fileName, fileType) => {
  const outputFileName = `${fileName}${fileType.extension}`;

  switch (fileType) {
    case FileTypes.JSON:
    case FileTypes.JSON_ARRAY:
      writeJsonToFile(data, outputFileName, fileType === FileTypes.JSON_ARRAY);
      break;

    case FileTypes.CSV:
      writeCsvToFile(data, outputFileName);
      break;
  }
};

export const readFileToData = (fileName, fileType) => {
  try {
    return (
      JSON.parse(
        readFileSync(
          path.join(OUTPUT_PATH, `${fileName}${fileType.extension}`),
          "utf-8"
        )
      ) || {}
    );
  } catch {
    return {};
  }
};
