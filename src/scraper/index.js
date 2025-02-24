import { TIMEOUT_FAST } from '../constants/index.js';

export const openPageAndNavigate = async (browser, url) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return page;
};

export const waitAndClick = async (page, selector, timeout = TIMEOUT_FAST) => {
  await page.waitForSelector(selector, { timeout });
  await page.evaluate(async (selector) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView();
      element.click();
    }
  }, selector);
};

export const waitForSelectorSafe = async (page, selector, timeout = TIMEOUT_FAST) => {
  try {
    await page.waitForSelector(selector, { timeout });
  } catch (error) {}
};
