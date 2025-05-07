import { BASE_URL } from '../../../constants/index.js';
import { openPageAndNavigate, waitAndClick, waitForSelectorSafe } from '../../index.js';

export const getMatchIdList = async (browser, leagueSeasonUrl) => {
  const page = await openPageAndNavigate(browser, `${leagueSeasonUrl}/results`);

  while (true) {
    try {
      await waitAndClick(page, 'a.event__more.event__more--static');
    } catch (error) {
      break;
    }
  }

  await waitForSelectorSafe(page, '.event__match.event__match--static.event__match--twoLine');

  const matchIdList = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.event__match.event__match--static.event__match--twoLine')).map((element) => {
      return element?.id?.replace('g_1_', '');
    });
  });

  await page.close();

  if (matchIdList.length === 0) {
    throw Error(`❌ No matches found on the results page\n` + `Please verify that the league name provided is correct`);
  }

  return matchIdList;
};

export const getMatchData = async (browser, matchId) => {
  const page = await openPageAndNavigate(browser, `${BASE_URL}/match/${matchId}/#/match-summary/match-summary`);

  await waitForSelectorSafe(page, '.duelParticipant__startTime');
  await waitForSelectorSafe(page, "div[data-testid='wcl-summaryMatchInformation'] > div'");

  const matchData = await extractMatchData(page);
  const information = await extractMatchInformation(page);

  await page.goto(`${BASE_URL}/match/${matchId}/#/match-summary/match-statistics/0`, { waitUntil: 'domcontentloaded' });
  await waitForSelectorSafe(page, "div[data-testid='wcl-statistics']");
  const statistics = await extractMatchStatistics(page);

  await page.close();
  return { ...matchData, information, statistics };
};

const extractMatchData = async (page) => {
  return await page.evaluate(async () => {
    return {
      stage: document.querySelector('.tournamentHeader__country > a')?.innerText.trim(),
      date: document.querySelector('.duelParticipant__startTime')?.innerText.trim(),
      status: document.querySelector('.fixedHeaderDuel__detailStatus')?.innerText.trim(),
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
        regulationTime: document
          .querySelector('.detailScore__fullTime')
          ?.innerText.trim()
          .replace(/[\n()]/g, ''),
        penalties: Array.from(document.querySelectorAll('[data-testid="wcl-scores-overline-02"]'))
          .find((element) => element.innerText.trim().toLowerCase() === 'penalties')
          ?.nextElementSibling?.innerText?.trim()
          .replace(/\s+/g, ''),
      },
    };
  });
};

const extractMatchInformation = async (page) => {
  return await page.evaluate(async () => {
    const elements = Array.from(document.querySelectorAll("div[data-testid='wcl-summaryMatchInformation'] > div"));
    return elements.reduce((acc, element, index) => {
      if (index % 2 === 0) {
        acc.push({
          category: element?.textContent
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/(^[:\s]+|[:\s]+$|:)/g, ''),
          value: elements[index + 1]?.innerText
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/(^[:\s]+|[:\s]+$|:)/g, ''),
        });
      }
      return acc;
    }, []);
  });
};

const extractMatchStatistics = async (page) => {
  return await page.evaluate(async () => {
    return Array.from(document.querySelectorAll("div[data-testid='wcl-statistics']")).map((element) => ({
      category: element.querySelector("div[data-testid='wcl-statistics-category']")?.innerText.trim(),
      homeValue: Array.from(element.querySelectorAll("div[data-testid='wcl-statistics-value'] > strong"))?.[0]?.innerText.trim(),
      awayValue: Array.from(element.querySelectorAll("div[data-testid='wcl-statistics-value'] > strong"))?.[1]?.innerText.trim(),
    }));
  });
};
