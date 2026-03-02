import inquirer from "inquirer";
import chalk from "chalk";

import { Sports } from "../../../constants/index.js";

export const selectSport = async (sport) => {
  if (sport) {
    console.info(`${chalk.green("✔")} Sport: ${chalk.cyan(sport.label)}`);
    return sport;
  }

  const choices = Object.values(Sports).map((s) => s.label);
  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Select a sport:",
      choices: [...choices, "Cancel"],
    },
  ]);

  if (choice === "Cancel") {
    console.info("\nNo option selected. Exiting...\n");
    throw Error;
  }

  return Object.values(Sports).find((s) => s.label === choice);
};
