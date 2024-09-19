import puppeteer from "puppeteer";
import cliProgress from "cli-progress";

import { getMatchData, getMatchIdList } from "./utils/scraping/index.js";
import { writeDataToFile } from "./utils/fileHandler/index.js";
import { convertDataToCsv } from "./utils/csvHandler/index.js";

(async () => {
  const commandLineArgs = process.argv.slice(2);
  const options = {
    country: null,
    league: null,
    mode: null,
    headless: false,
    outputPath: "./src/data",
    fileType: "json",
  };

  commandLineArgs.forEach((arg) => {
    if (arg.startsWith("country=")) options.country = arg.split("=")[1];
    if (arg.startsWith("league=")) options.league = arg.split("=")[1];
    if (arg.startsWith("mode=")) options.mode = arg.split("=")[1];
    if (arg === "headless") options.headless = "shell";
    if (arg.startsWith("path=")) options.outputPath = arg.split("=")[1];
    if (arg.startsWith("type=")) options.fileType = arg.split("=")[1];
  });

  const { country, league, mode, headless, fileType, outputPath } = options;

  if (!country || !league) {
    console.error("ERROR: You must set country and league parameters.");
    console.error(
      "For usage instructions, please refer to the documentation at https://github.com/gustavofariaa/FlashscoreScraping"
    );
    return;
  }

  const browser = await puppeteer.launch({ headless });

  const matchIdList = await getMatchIdList(browser, country, league, mode);

  const progressBar = new cliProgress.SingleBar({
    format: "Progress {bar} {percentage}% | {value}/{total}",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });
  progressBar.start(matchIdList.length, 0);

  const matchData = {};
  for (const matchId of matchIdList) {
    matchData[matchId] = await getMatchData(browser, matchId, mode);

    switch (fileType) {
      case "json":
        writeDataToFile(
          matchData,
          outputPath,
          `${country}-${league}-${mode}`,
          fileType
        );
        break;

      case "csv":
        const csvData = convertDataToCsv(matchData);
        writeDataToFile(csvData, outputPath, `${country}-${league}-${mode}`, fileType);
        break;

      default:
        console.error("ERROR: Invalid file type.");
        console.error(
          "For usage instructions, please refer to the documentation at https://github.com/gustavofariaa/FlashscoreScraping"
        );
    }

    progressBar.increment();
  }

  progressBar.stop();

  await browser.close();
})();
