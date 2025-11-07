import { BASE_URL } from "../../../constants/index.js";
import {
  openPageAndNavigate,
  waitAndClick,
  waitForSelectorSafe,
} from "../../index.js";

export const getListOfCountries = async (context) => {
  const page = await openPageAndNavigate(context, BASE_URL, true);

  const toggleMenuSelector = "#category-left-menu > div > span";
  const countryLinksSelector = "#category-left-menu a";

  await waitAndClick(page, toggleMenuSelector);
  await waitForSelectorSafe(page, [countryLinksSelector]);

  const countries = await page.evaluate((selector) => {
    return Array.from(document.querySelectorAll(selector))
      .map((element) => {
        return {
          name: element.innerText.trim(),
          url: element.href,
          id: element.id,
        };
      })
      .filter(Boolean);
  }, countryLinksSelector);

  return countries;
};
