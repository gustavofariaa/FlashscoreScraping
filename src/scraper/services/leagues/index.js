import { BASE_URL, TIMEOUT } from '../../../constants/index.js';
import { openPageAndNavigate, waitAndClick, waitForSelectorSafe } from '../../index.js';

export const getListOfLeagues = async (browser, countryId) => {
  const page = await openPageAndNavigate(browser, BASE_URL);

  await waitAndClick(page, '#category-left-menu > div > span');
  await waitAndClick(page, `#${countryId}`);
  await waitForSelectorSafe(page, `#${countryId} ~ span > a`, TIMEOUT);

  const listOfLeagues = await page.evaluate((countryId) => {
    return Array.from(document.querySelectorAll(`#${countryId} ~ span > a`)).map((element) => {
      return { name: element.innerText.trim(), url: element.href };
    });
  }, countryId);

  await page.close();
  return listOfLeagues;
};
