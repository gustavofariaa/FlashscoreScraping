import puppeteer from 'puppeteer';

import { getMatchData, getMatchIdList } from './utils/scraping/index.js';
import { initializeProgressBar, parseArguments, selectCountry, selectFileType, selectLeague, selectLeagueSeason, start, stop } from './utils/cmd/index.js';
import { handleFileType } from './utils/fileHandler/index.js';
import { BASE_URL, OUTPUT_PATH } from './constants/index.js';

(async () => {
  const options = parseArguments();

  const browser = await puppeteer.launch({ headless: options.headless });

  if (options.fileType === null) options.fileType = await selectFileType();

  const selectedCountry = options.country ? { name: options.country } : await selectCountry(browser);
  const selectedLeague = options.league ? { name: options.league } : await selectLeague(browser, selectedCountry?.id);

  const selectedLeagueSeason = selectedLeague?.url
    ? await selectLeagueSeason(browser, selectedLeague?.url)
    : { name: selectedLeague?.name, url: `${BASE_URL}/football/${selectedCountry?.name}/${selectedLeague?.name}` };

  const fileName = `${selectedCountry?.name}_${selectedLeagueSeason?.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  console.info(`\n📝 Data collection has started!`);
  console.info(`The league data will be saved to: ${OUTPUT_PATH}/${fileName}.${options.fileType}`);

  start();
  const matchIdList = await getMatchIdList(browser, selectedLeagueSeason?.url);
  stop();

  console.info('');
  const progressBar = initializeProgressBar(matchIdList.length);

  const matchData = {};
  for (const matchId of matchIdList) {
    matchData[matchId] = await getMatchData(browser, matchId);
    handleFileType(matchData, options.fileType, fileName);
    progressBar.increment();
  }

  progressBar.stop();

  console.info('\n✅ Data collection and file writing completed!');
  console.info(`The data has been successfully saved to: ${OUTPUT_PATH}/${fileName}.${options.fileType}\n`);

  await browser.close();
})();
