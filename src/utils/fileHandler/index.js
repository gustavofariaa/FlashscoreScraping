import fs from "fs";
import path from "path";
import jsonexport from "jsonexport";

export const writeDataToFile = (data, outputPath, fileName, fileType) => {
  switch (fileType) {
    case "json":
      writeJsonToFile(data, outputPath, fileName);
      break;

    case "csv":
      writeCsvToFile(data, outputPath, fileName);
      break;

    default:
      console.error("ERROR: Invalid file type.");
      console.error(
        "For usage instructions, please refer to the documentation at https://github.com/gustavofariaa/FlashscoreScraping"
      );
  }
};

const writeJsonToFile = (data, outputPath, fileName) => {
  const filePath = path.join(outputPath, `${fileName}.json`);
  const fileContent = JSON.stringify(data, null, 2);

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileContent);
  } catch (error) {
    console.error(`Error creating directories or writing to JSON file:`, error);
  }
};

const writeCsvToFile = (data, outputPath, fileName) => {
  const filePath = path.join(outputPath, `${fileName}.csv`);

  jsonexport(data, (error, fileContent) => {
    if (error) throw error;

    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, fileContent);
    } catch (error) {
      console.error(
        `Error creating directories or writing to CSV file:`,
        error
      );
    }
  });
};
