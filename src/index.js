import { chromium } from "playwright";
import { pLimit } from "./utils/index.js";
import chalk from "chalk";

import { OUTPUT_PATH } from "./constants/index.js";
import { parseArguments } from "./cli/arguments/index.js";
import { promptUserOptions } from "./cli/prompts/index.js";
import { start, stop } from "./cli/loader/index.js";
import { initializeProgressbar } from "./cli/progressbar/index.js";

import {
  getMatchLinks,
  getMatchData,
} from "./scraper/services/matches/index.js";

import { writeDataToFile } from "./files/handle/index.js";

(async () => {
  let browser;
  let context;

  try {
    const cliOptions = parseArguments();

    browser = await chromium.launch({ headless: cliOptions.headless });
    context = await browser.newContext();

    const { fileName, season, fileType } = await promptUserOptions(
      context,
      cliOptions
    );

    start();
    const matchLinksResults = await getMatchLinks(
      context,
      season?.url,
      "results"
    );
    const matchLinksFixtures = await getMatchLinks(
      context,
      season?.url,
      "fixtures"
    );
    const matchLinks = [...matchLinksFixtures, ...matchLinksResults];

    if (matchLinks.length === 0) {
      throw Error(
        `❌ No matches found on the results page\n` +
          `Please verify that the league name provided is correct`
      );
    }
    stop();

    const progressbar = initializeProgressbar(matchLinks.length);
    const limit = pLimit(cliOptions.concurrency);

    const matchData = {};
    let processedCount = 0;

    const tasks = matchLinks.map((matchLink) =>
      limit(async () => {
        const data = await getMatchData(context, matchLink);
        matchData[matchLink.id] = data;

        processedCount += 1;
        if (processedCount % cliOptions.saveInterval === 0) {
          writeDataToFile(matchData, fileName, fileType);
        }

        progressbar.increment();
      })
    );

    await Promise.all(tasks);

    progressbar.stop();
    writeDataToFile(matchData, fileName, fileType);

    console.info("\n✅ Data collection and file writing completed!");
    console.info(
      `📁 File saved to: ${chalk.cyan(
        `${OUTPUT_PATH}/${fileName}${fileType.extension}`
      )}\n`
    );
  } catch (error) {
    stop();
    if (error.message) console.error(`\n${error.message}\n`);
  } finally {
    await context?.close();
    await browser?.close();
  }
})();
