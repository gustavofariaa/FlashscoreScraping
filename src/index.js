import { chromium } from "playwright";
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

  try {
    const cliOptions = parseArguments();
    browser = await chromium.launch({ headless: cliOptions.headless });

    const { fileName, season, fileType } = await promptUserOptions(
      browser,
      cliOptions
    );

    start();
    const matchLinks = await getMatchLinks(browser, season?.url);
    stop();

    const progressbar = initializeProgressbar(matchLinks.length);

    const matchData = {};
    for (const matchLink of matchLinks) {
      matchData[matchLink.id] = await getMatchData(browser, matchLink);
      writeDataToFile(matchData, fileName, fileType);
      progressbar.increment();
    }

    progressbar.stop();

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
    await browser?.close();
  }
})();
