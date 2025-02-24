import inquirer from 'inquirer';

import { getListOfSeasons } from '../../../scraper/services/seasons/index.js';

import { start, stop } from '../../loader/index.js';

export const selectSeason = async (browser, leagueUrl) => {
  start();
  const seasons = await getListOfSeasons(browser, leagueUrl);
  stop();
  const options = seasons.map((season) => season.name);

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select a league season:',
      choices: [...options, 'Cancel', new inquirer.Separator()],
    },
  ]);

  if (choice === 'Cancel') {
    console.log('No option selected. Exiting...');
    process.exit(1);
  }

  return seasons.find((season) => season.name === choice);
};
