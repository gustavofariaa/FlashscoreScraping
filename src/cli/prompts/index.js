import chalk from 'chalk';

import { BASE_URL, OUTPUT_PATH } from '../../constants/index.js';

import { selectFileType } from './fileType/index.js';
import { selectCountry } from './countries/index.js';
import { selectLeague } from './leagues/index.js';
import { selectSeason } from './season/index.js';

export const promptUserOptions = async (browser, cliOptions) => {
  const fileType = await selectFileType(cliOptions?.fileType);
  const country = await selectCountry(browser, cliOptions?.country);
  const season = await resolveSeason(browser, cliOptions, country);

  const fileName = generateFileName(country?.name, season?.name);

  console.info(`\n📝 Starting data collection...`);
  console.info(`📁 File will be saved to: ${chalk.cyan(`${OUTPUT_PATH}/${fileName}${fileType.extension}`)}`);

  return { fileName, season, fileType };
};

const resolveSeason = async (browser, cliOptions, country) => {
  if (!cliOptions?.league) {
    const league = await selectLeague(browser, country?.id);
    return await selectSeason(browser, league?.url);
  }

  const leagueName = capitalizeWords(cliOptions.league);
  console.info(`${chalk.green('✔')} League season: ${chalk.cyan(leagueName)}`);

  return {
    name: leagueName,
    url: `${BASE_URL}/football/${country?.name}/${cliOptions.league}`.toLowerCase(),
  };
};

const generateFileName = (countryName = '', seasonName = '') => {
  return `${countryName}_${seasonName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const capitalizeWords = (str) => {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};
