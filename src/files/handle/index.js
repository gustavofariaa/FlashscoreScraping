import { FileTypes, OUTPUT_PATH } from '../../constants/index.js';

import { writeJsonToFile } from '../../files/json/index.js';
import { writeCsvToFile } from '../../files/csv/index.js';

export const handleFileType = (data, fileName, fileType) => {
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
