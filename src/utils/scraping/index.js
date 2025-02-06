import { BASE_URL, TIMEOUT, TIMEOUT_FAST } from '../../constants/index.js';

const openPageAndNavigate = async (browser, url) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return page;
};

const waitAndClick = async (page, selector) => {
  await page.waitForSelector(selector, { timeout: TIMEOUT_FAST });
  await page.evaluate(async (selector) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView();
      element.click();
    }
  }, selector);
};

export const getListOfCountries = async (browser) => {
  const page = await openPageAndNavigate(browser, BASE_URL);
  await waitAndClick(page, '#category-left-menu > div > span');

  await page.waitForSelector('#category-left-menu > div > div > a', { timeout: TIMEOUT_FAST });
  const listOfCountries = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#category-left-menu > div > div > a')).map((element) => {
      return { name: element.innerText.trim(), url: element.href, id: element.id };
    });
  });

  await page.close();
  return listOfCountries;
};

export const getListOfLeagues = async (browser, countryId) => {
  const page = await openPageAndNavigate(browser, BASE_URL);

  await waitAndClick(page, '#category-left-menu > div > span');
  await waitAndClick(page, `#${countryId}`);

  await page.waitForSelector(`#${countryId} ~ span > a`, { timeout: TIMEOUT });
  const listOfLeagues = await page.evaluate((countryId) => {
    return Array.from(document.querySelectorAll(`#${countryId} ~ span > a`)).map((element) => {
      return { name: element.innerText.trim(), url: element.href };
    });
  }, countryId);

  await page.close();
  return listOfLeagues;
};

export const getListOfLeagueSeasons = async (browser, leagueUrl) => {
  const page = await openPageAndNavigate(browser, `${leagueUrl}/archive`);

  await page.waitForSelector('div.archive__season > a', { timeout: TIMEOUT });
  const listOfLeagueSeasons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div.archive__season > a')).map((element) => {
      return { name: element.innerText.trim(), url: element.href };
    });
  });

  await page.close();
  return listOfLeagueSeasons;
};

export const getMatchIdList = async (browser, leagueSeasonUrl) => {
  const page = await openPageAndNavigate(browser, `${leagueSeasonUrl}/results`);

  while (true) {
    try {
      await waitAndClick(page, 'a.event__more.event__more--static');
    } catch (error) {
      break;
    }
  }

  await page.waitForSelector('.event__match.event__match--static.event__match--twoLine', { timeout: TIMEOUT_FAST });
  const matchIdList = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.event__match.event__match--static.event__match--twoLine')).map((element) => {
      return element?.id?.replace('g_1_', '');
    });
  });

  await page.close();
  return matchIdList;
};

export const getMatchData = async (browser, matchId) => {
  const page = await openPageAndNavigate(browser, `${BASE_URL}/match/${matchId}/#/match-summary/match-statistics/0`);

  await page.waitForSelector('.duelParticipant__startTime', { timeout: TIMEOUT_FAST });
  const data = await page.evaluate(async () => {
    return {
      date: document.querySelector('.duelParticipant__startTime')?.innerText.trim(),
      home: {
        name: document.querySelector('.duelParticipant__home .participant__participantName.participant__overflow')?.innerText.trim(),
        image: document.querySelector('.duelParticipant__home .participant__image')?.src,
      },
      away: {
        name: document.querySelector('.duelParticipant__away .participant__participantName.participant__overflow')?.innerText.trim(),
        image: document.querySelector('.duelParticipant__away .participant__image')?.src,
      },
      result: {
        home: Array.from(document.querySelectorAll('.detailScore__wrapper span:not(.detailScore__divider)'))?.[0]?.innerText.trim(),
        away: Array.from(document.querySelectorAll('.detailScore__wrapper span:not(.detailScore__divider)'))?.[1]?.innerText.trim(),
        penalty: document.querySelector('.detailScore__fullTime')?.innerText.trim(),
        status: document.querySelector('.fixedHeaderDuel__detailStatus')?.innerText.trim(),
      },
    };
  });

  try {
    await page.waitForSelector("div[data-testid='wcl-statistics']", { timeout: TIMEOUT_FAST });
  } catch (error) {}
  const statistics = await page.evaluate(async () => {
    return Array.from(document.querySelectorAll("div[data-testid='wcl-statistics']")).map((element) => ({
      category: element.querySelector("div[data-testid='wcl-statistics-category']")?.innerText.trim(),
      homeValue: Array.from(element.querySelectorAll("div[data-testid='wcl-statistics-value'] > strong"))?.[0]?.innerText.trim(),
      awayValue: Array.from(element.querySelectorAll("div[data-testid='wcl-statistics-value'] > strong"))?.[1]?.innerText.trim(),
    }));
  });

  await page.goto(`${BASE_URL}/match/${matchId}/#/match-summary/match-summary`, { waitUntil: 'domcontentloaded' });

  try {
    await page.waitForSelector("div[data-testid='wcl-summaryMatchInformation'] > div']", { timeout: TIMEOUT_FAST });
  } catch (error) {}
  const information = await page.evaluate(async () => {
    const elements = Array.from(document.querySelectorAll("div[data-testid='wcl-summaryMatchInformation'] > div"));
    return elements.reduce((acc, element, index) => {
      if (index % 2 === 0) {
        acc.push({
          category: element?.textContent
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/^[:\s]+|[:\s]+$/g, '')
            .replace(/:/g, ''),
          value:
            elements[index + 1]?.innerText
              .trim()
              .replace(/\s+/g, ' ')
              .replace(/^[:\s]+|[:\s]+$/g, '') || '',
        });
      }
      return acc;
    }, []);
  });

  await page.close();
  return { ...data, statistics, information };
};
