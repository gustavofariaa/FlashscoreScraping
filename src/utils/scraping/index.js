import { BASE_URL } from "../../constants/index.js";

export const getMatchIdList = async (browser, country, league, mode) => {
  const page = await browser.newPage();

  const url = `${BASE_URL}/football/${country}/${league}/${mode}/`;
  await page.goto(url);

  while (true) {
    try {
      await page.evaluate(async (_) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const element = document.querySelector(
          "a.event__more.event__more--static"
        );
        element.scrollIntoView();
        element.click();
      });
    } catch (error) {
      break;
    }
  }

  const matchIdList = await page.evaluate((_) => {
    return Array.from(
      document.querySelectorAll(
        ".event__match.event__match--static.event__match--twoLine"
      )
    ).map((element) => element?.id?.replace("g_1_", ""));
  });

  await page.close();
  return matchIdList;
};

export const getMatchData = async (browser, matchId, mode) => {
  const page = await browser.newPage();

  const url = `${BASE_URL}/match/${matchId}/#/match-summary/match-statistics/0`;
  await page.goto(url);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const data = await page.evaluate(async () => ({
    date: document.querySelector(".duelParticipant__startTime")?.outerText,
    home: {
      name: document.querySelector(
        ".duelParticipant__home .participant__participantName.participant__overflow"
      )?.outerText,
      image: document.querySelector(
        ".duelParticipant__home .participant__image"
      )?.src,
    },
    away: {
      name: document.querySelector(
        ".duelParticipant__away .participant__participantName.participant__overflow"
      )?.outerText,
      image: document.querySelector(
        ".duelParticipant__away .participant__image"
      )?.src,
    },
    result: {
      home: Array.from(
        document.querySelectorAll(
          ".detailScore__wrapper span:not(.detailScore__divider)"
        )
      )?.[0]?.outerText,
      away: Array.from(
        document.querySelectorAll(
          ".detailScore__wrapper span:not(.detailScore__divider)"
        )
      )?.[1]?.outerText,
      penalty: document.querySelector(".detailScore__fullTime")?.textContent,
      status: document.querySelector(".fixedHeaderDuel__detailStatus")
        ?.outerText,
    },
    statistics: Array.from(
      document.querySelectorAll("div[data-testid='wcl-statistics']")
    ).map((element) => ({
      categoryName: element.querySelector(
        "div[data-testid='wcl-statistics-category']"
      )?.innerText,
      homeValue: Array.from(
        element.querySelectorAll(
          "div[data-testid='wcl-statistics-value'] > strong"
        )
      )?.[0]?.innerText,
      awayValue: Array.from(
        element.querySelectorAll(
          "div[data-testid='wcl-statistics-value'] > strong"
        )
      )?.[1]?.innerText,
    })),
  }));

  if (mode == 'fixtures'){
    delete data.result;
    delete data.statistics;
  }

  await page.close();
  return data;
};
