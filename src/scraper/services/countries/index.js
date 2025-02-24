import { BASE_URL } from '../../../constants/index.js';
import { openPageAndNavigate, waitAndClick, waitForSelectorSafe } from '../../index.js';

export const getListOfCountries = async (browser) => {
  const page = await openPageAndNavigate(browser, BASE_URL);

  await waitAndClick(page, '#category-left-menu > div > span');
  await waitForSelectorSafe(page, '#category-left-menu > div > div > a');

  const listOfCountries = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#category-left-menu > div > div > a')).map((element) => {
      return { name: element.innerText.trim(), url: element.href, id: element.id };
    });
  });

  await page.close();
  return listOfCountries;
};
