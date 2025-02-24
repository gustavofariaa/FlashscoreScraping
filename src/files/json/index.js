import fs from 'fs';
import path from 'path';

export const writeJsonToFile = (data, outputPath, fileName) => {
  const filePath = path.join(outputPath, `${fileName}.json`);
  const fileContent = JSON.stringify(data, null, 2);

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileContent);
  } catch (error) {
    console.error(`Error creating directories or writing to JSON file:`, error);
  }
};
