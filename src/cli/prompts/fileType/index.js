import inquirer from 'inquirer';
import chalk from 'chalk';

import { FileTypes } from '../../../constants/index.js';

export const selectFileType = async (fileType) => {
  if (fileType) {
    console.info(`${chalk.green('✔')} Select a output file type: ${chalk.cyan(fileType.label)}`);
    return fileType;
  }

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select a output file type:',
      choices: [...getFileTypeChoices(), 'Cancel'],
    },
  ]);

  if (choice === 'Cancel') {
    console.log('No option selected. Exiting...');
    process.exit(1);
  }

  return Object.values(FileTypes).find((type) => type.label === choice);
};

const getFileTypeChoices = () => {
  return Object.values(FileTypes).map((type) => type.label);
};
