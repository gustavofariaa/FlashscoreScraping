import inquirer from 'inquirer';
import chalk from 'chalk';

import { FileTypes } from '../../../constants/index.js';

export const selectFileType = async (fileType) => {
  if (fileType) {
    console.info(`${chalk.green('✔')} File type: ${chalk.cyan(fileType.label)}`);
    return fileType;
  }

  const choices = Object.values(FileTypes).map((type) => type.label);
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select a output file type:',
      choices: [...choices, 'Cancel'],
    },
  ]);

  if (choice === 'Cancel') {
    console.info('\nNo option selected. Exiting...\n');
    throw Error;
  }

  return Object.values(FileTypes).find((type) => type.label === choice);
};
