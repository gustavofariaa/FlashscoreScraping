import inquirer from 'inquirer';
import { loading } from 'cli-loading-animation';
import cliProgress from 'cli-progress';

import { getListOfCountries, getListOfLeagues, getListOfLeagueSeasons } from '../scraping/index.js';

export const { start, stop } = loading('Loading...');

export const parseArguments = () => {
  const args = process.argv.slice(2);
  const options = {
    country: null,
    league: null,
    headless: 'shell',
    fileType: null,
  };

  args.forEach((arg) => {
    if (arg.startsWith('country=')) options.country = arg.split('=')[1];
    if (arg.startsWith('league=')) options.league = arg.split('=')[1];
    if (arg.startsWith('fileType=')) options.fileType = arg.split('=')[1];
    if (arg === 'no-headless') options.headless = false;
  });

  return options;
};

export const selectFileType = async () => {
  const options = ['json', 'csv'];
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select a output file type:',
      choices: ['json', 'csv', 'Cancel'],
    },
  ]);

  if (choice === 'Cancel') {
    console.log('No option selected. Exiting...');
    process.exit(1);
  }

  return options.find((element) => element === choice);
};

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
    console.log('No option selected. Exiting...');
    process.exit(1);
  }

  return leagues.find((league) => league.name === choice);
};

export const selectLeagueSeason = async (browser, leagueUrl) => {
  start();
  const seasons = await getListOfLeagueSeasons(browser, leagueUrl);
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

export const initializeProgressBar = (total) => {
  const progressBar = new cliProgress.SingleBar({
    format: 'Progress: {bar} | {percentage}% | {value}/{total} matches',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  progressBar.start(total, 0);
  return progressBar;
};
