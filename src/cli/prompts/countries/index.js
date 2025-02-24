import inquirer from 'inquirer';

import { getListOfCountries } from '../../../scraper/services/countries/index.js';

import { start, stop } from '../../loader/index.js';

export const selectCountry = async (browser) => {
  start();
  const countries = await getListOfCountries(browser);
  stop();

  const options = countries.map((element) => element.name);

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select a country:',
      choices: [...options, 'Cancel', new inquirer.Separator()],
    },
  ]);

  if (choice === 'Cancel') {
    console.log('No option selected. Exiting...');
    process.exit(1);
  }

  return countries.find((country) => country.name === choice);
};
