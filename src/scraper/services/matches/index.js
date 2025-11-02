import { openPageAndNavigate, waitForSelectorSafe } from "../../index.js";
import { BASE_URL_MOBI } from "../../../constants/index.js";

export const getMatchLinks = async (context, leagueSeasonUrl, type) => {
  const page = await openPageAndNavigate(context, `${leagueSeasonUrl}/${type}`);

  const LOAD_MORE_SELECTOR = '[data-testid="wcl-buttonLink"]';
  const MATCH_SELECTOR =
    ".event__match.event__match--static.event__match--twoLine";
  const CLICK_DELAY = 600;
  const MAX_EMPTY_CYCLES = 4;

  let emptyCycles = 0;

  while (true) {
    const countBefore = await page.$$eval(MATCH_SELECTOR, (els) => els.length);

    const loadMoreBtn = await page.$(LOAD_MORE_SELECTOR);
    if (!loadMoreBtn) break;

    try {
      await loadMoreBtn.click();
      await page.waitForTimeout(CLICK_DELAY);
    } catch {
      break;
    }

    const countAfter = await page.$$eval(MATCH_SELECTOR, (els) => els.length);

    if (countAfter === countBefore) {
      emptyCycles++;
      if (emptyCycles >= MAX_EMPTY_CYCLES) break;
    } else {
      emptyCycles = 0;
    }
  }

  await waitForSelectorSafe(page, [MATCH_SELECTOR]);

  const matchIdList = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        ".event__match.event__match--static.event__match--twoLine"
      )
    ).map((element) => {
      const id = element?.id?.replace("g_1_", "");
      const url = element.querySelector("a.eventRowLink")?.href ?? null;
      return { id, url };
    });
  });

  await page.close();

  return matchIdList;
};

export const getMatchData = async (context, { id: matchId, url }) => {
  const page = await openPageAndNavigate(context, url);

  await waitForSelectorSafe(page, [
    ".duelParticipant__startTime",
    "div[data-testid='wcl-summaryMatchInformation'] > div'",
  ]);

  const matchData = await extractMatchData(page);
  const information = await extractMatchInformation(page);
  const statistics = await extractMatchStatisticsMobi(matchId);

  await page.close();
  return { matchId, ...matchData, information, statistics };
};

const extractMatchData = async (page) => {
  await waitForSelectorSafe(page, [
    "span[data-testid='wcl-scores-overline-03']",
    ".duelParticipant__startTime",
    ".fixedHeaderDuel__detailStatus",
    ".tournamentHeader__country > a",
    ".detailScore__wrapper span:not(.detailScore__divider)",
    ".duelParticipant__home .participant__image",
    ".duelParticipant__away .participant__image",
    ".duelParticipant__home .participant__participantName.participant__overflow",
    ".duelParticipant__away .participant__participantName.participant__overflow",
  ]);

  return await page.evaluate(() => {
    return {
      stage: Array.from(
        document.querySelectorAll("span[data-testid='wcl-scores-overline-03']")
      )?.[2]
        ?.innerText.trim()
        ?.split(" - ")
        .pop()
        .trim(),
      date: document
        .querySelector(".duelParticipant__startTime")
        ?.innerText.trim(),
      status:
        document
          .querySelector(".fixedHeaderDuel__detailStatus")
          ?.innerText.trim() ?? "NOT STARTED",
      home: {
        name: document
          .querySelector(
            ".duelParticipant__home .participant__participantName.participant__overflow"
          )
          ?.innerText.trim(),
        image: document.querySelector(
          ".duelParticipant__home .participant__image"
        )?.src,
      },
      away: {
        name: document
          .querySelector(
            ".duelParticipant__away .participant__participantName.participant__overflow"
          )
          ?.innerText.trim(),
        image: document.querySelector(
          ".duelParticipant__away .participant__image"
        )?.src,
      },
      result: {
        home: Array.from(
          document.querySelectorAll(
            ".detailScore__wrapper span:not(.detailScore__divider)"
          )
        )?.[0]?.innerText.trim(),
        away: Array.from(
          document.querySelectorAll(
            ".detailScore__wrapper span:not(.detailScore__divider)"
          )
        )?.[1]?.innerText.trim(),
        regulationTime: document
          .querySelector(".detailScore__fullTime")
          ?.innerText.trim()
          .replace(/[\n()]/g, ""),
        penalties: Array.from(
          document.querySelectorAll('[data-testid="wcl-scores-overline-02"]')
        )
          .find(
            (element) => element.innerText.trim().toLowerCase() === "penalties"
          )
          ?.nextElementSibling?.innerText?.trim()
          .replace(/\s+/g, ""),
      },
    };
  });
};

const extractMatchInformation = async (page) => {
  return await page.evaluate(async () => {
    const elements = Array.from(
      document.querySelectorAll(
        "div[data-testid='wcl-summaryMatchInformation'] > div"
      )
    );
    return elements.reduce((acc, element, index) => {
      if (index % 2 === 0) {
        acc.push({
          category: element?.textContent
            .trim()
            .replace(/\s+/g, " ")
            .replace(/(^[:\s]+|[:\s]+$|:)/g, ""),
          value: elements[index + 1]?.innerText
            .trim()
            .replace(/\s+/g, " ")
            .replace(/(^[:\s]+|[:\s]+$|:)/g, ""),
        });
      }
      return acc;
    }, []);
  });
};

export const extractMatchStatisticsMobi = async (matchId) => {
  const response = await fetch(`${BASE_URL_MOBI}/match/${matchId}/?t=stats`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 13)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  const html = await response.text();

  return html
    .split('data-testid="wcl-statistics"')
    .slice(1)
    .map((section) => {
      const categoryMatch = section.match(
        /wcl-statistics-category[^>]*>(.*?)<\/div>/
      );
      if (!categoryMatch) return null;

      const categoryName = categoryMatch[1].replace(/<[^>]+>/g, "").trim();

      const valueMatches = [
        ...section.matchAll(
          /wcl-statistics-value[^>]*>[\s\S]*?<strong[^>]*>(.*?)<\/strong>/g
        ),
      ].map((match) => match[1].trim());

      if (valueMatches.length < 2) return null;

      return {
        category: categoryName,
        homeValue: valueMatches[0],
        awayValue: valueMatches[1],
      };
    })
    .filter(Boolean)
    .reduce((uniqueStats, stat) => {
      if (!uniqueStats.some((s) => s.category === stat.category)) {
        uniqueStats.push(stat);
      }
      return uniqueStats;
    }, []);
};
