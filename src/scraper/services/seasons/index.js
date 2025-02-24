import { TIMEOUT } from '../../../constants/index.js';
import { openPageAndNavigate, waitForSelectorSafe } from '../../index.js';

export const getListOfSeasons = async (browser, leagueUrl) => {
  const page = await openPageAndNavigate(browser, `${leagueUrl}/archive`);

  await waitForSelectorSafe(page, 'div.archive__season > a', TIMEOUT);

  const listOfLeagueSeasons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div.archive__season > a')).map((element) => {
      return { name: element.innerText.trim(), url: element.href };
    });
  });

  await page.close();
  return listOfLeagueSeasons;
};
