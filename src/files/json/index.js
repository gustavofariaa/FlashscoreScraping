import fs from 'fs';
import path from 'path';

const toArray = (data) => {
  return Object.keys(data).map((key) => ({
    matchId: key,
    ...JSON.parse(JSON.stringify(data[key])), // Cópia profunda
  }));
};

export const writeJsonToFile = (data, outputPath, fileName, array = false) => {
  if (array) data = toArray(data);

<<<<<<< HEAD
  const filePath = path.join(outputPath, `${fileName}.json${array ? '-array' : ''}`);
=======
  const filePath = path.join(outputPath, `${fileName}${array ? '-array' : ''}.json`);
>>>>>>> main
  const fileContent = JSON.stringify(data, null, 2);

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileContent);
  } catch (error) {
    console.error(`Error creating directories or writing to JSON file:`, error);
  }
};
