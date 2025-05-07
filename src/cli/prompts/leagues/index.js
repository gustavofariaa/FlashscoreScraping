import inquirer from 'inquirer';

import { getListOfLeagues } from '../../../scraper/services/leagues/index.js';

import { start, stop } from '../../loader/index.js';

export const selectLeague = async (browser, countryId) => {
  start();
  const leagues = await getListOfLeagues(browser, countryId);
  stop();
  const options = leagues.map((element) => element.name);

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select a league:',
      choices: [...options, 'Cancel', new inquirer.Separator()],
    },
  ]);

  if (choice === 'Cancel') {
    console.info('\nNo option selected. Exiting...\n');
    throw Error;
  }

  return leagues.find((league) => league.name === choice);
};
