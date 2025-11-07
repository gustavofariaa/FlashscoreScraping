import { TIMEOUT } from "../constants/index.js";

export const openPageAndNavigate = async (
  context,
  url,
  samePage = false,
  timeout = TIMEOUT
) => {
  const page = samePage
    ? context.pages()?.[0] ?? (await context.newPage())
    : await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const CLOSE_MODAL = "[data-testid='wcl-dialogCloseButton']";
  const ACCEPT_COOKIES = "#onetrust-accept-btn-handler";

  await Promise.allSettled([
    page
      .waitForSelector(CLOSE_MODAL, { timeout })
      .then(() => page.click(CLOSE_MODAL).catch(() => {})),
    page
      .waitForSelector(ACCEPT_COOKIES, { timeout })
      .then(() => page.click(ACCEPT_COOKIES).catch(() => {})),
  ]);

  return page;
};

export const waitAndClick = async (page, selector, timeout = TIMEOUT) => {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el)
        el.scrollIntoView({
          block: "center",
          inline: "center",
          behavior: "instant",
        });
    }, selector);
    await page.click(selector, { delay: 300 });
    return true;
  } catch (err) {
    return false;
  }
};

export const waitForSelectorSafe = async (
  page,
  selectors = [],
  timeout = TIMEOUT
) => {
  return Promise.all(
    selectors.map(async (selector) => {
      try {
        await page.waitForSelector(selector, { timeout });
      } catch {}
    })
  );
};
