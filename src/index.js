import puppeteer from 'puppeteer';

import { BASE_URL, OUTPUT_PATH } from './constants/index.js';

import { parseArguments } from './cli/arguments/index.js';

import { selectFileType } from './cli/prompts/fileType/index.js';
import { selectCountry } from './cli/prompts/countries/index.js';
import { selectLeague } from './cli/prompts/leagues/index.js';
import { selectSeason } from './cli/prompts/season/index.js';

import { start, stop } from './cli/loader/index.js';
import { initializeProgressbar } from './cli/progressbar/index.js';

import { getMatchIdList, getMatchData } from './scraper/services/matches/index.js';

import { handleFileType } from './files/handle/index.js';

(async () => {
  const options = parseArguments();
  const browser = await puppeteer.launch({ headless: options.headless });

  const fileType = options.fileType || (await selectFileType());
  const country = options.country ? { name: options.country } : await selectCountry(browser);
  const league = options.league ? { name: options.league } : await selectLeague(browser, country?.id);

  const season = league?.url ? await selectSeason(browser, league?.url) : { name: league?.name, url: `${BASE_URL}/football/${country?.name}/${league?.name}` };

  const fileName = `${country?.name}_${season?.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  console.info(`\n📝 Data collection has started!`);
  console.info(`The league data will be saved to: ${OUTPUT_PATH}/${fileName}.${fileType}`);

  start();
  const matchIdList = await getMatchIdList(browser, season?.url);
  stop();

  const progressbar = initializeProgressbar(matchIdList.length);

  const matchData = {};
  for (const matchId of matchIdList) {
    matchData[matchId] = await getMatchData(browser, matchId);
    handleFileType(matchData, fileType, fileName);
    progressbar.increment();
  }

  progressbar.stop();

  console.info('\n✅ Data collection and file writing completed!');
  console.info(`The data has been successfully saved to: ${OUTPUT_PATH}/${fileName}.${fileType}\n`);

  await browser.close();
})();
