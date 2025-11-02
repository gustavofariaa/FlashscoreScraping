import inquirer from "inquirer";
import chalk from "chalk";

import { getListOfCountries } from "../../../scraper/services/countries/index.js";

import { start, stop } from "../../loader/index.js";

export const selectCountry = async (context, inputCountry) => {
  start();
  const countries = await getListOfCountries(context);
  stop();

  const selected = findCountry(countries, inputCountry);
  if (selected) {
    console.info(`${chalk.green("✔")} Country: ${chalk.cyan(selected.name)}`);
    return selected;
  } else if (inputCountry) {
    throw Error(
      `❌ No country found for "${inputCountry}"\n` +
        `Please verify that the country name provided is correct`
    );
  }

  const choices = countries.map(({ name }) => name).sort();
  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Select a country:",
      choices: [...choices, "Cancel", new inquirer.Separator()],
    },
  ]);

  if (choice === "Cancel") {
    console.info("\nNo option selected. Exiting...\n");
    throw Error;
  }

  return findCountry(countries, choice);
};

const findCountry = (countries, targetName) => {
  if (!targetName) return null;
  return countries.find(
    ({ name }) => formatCountryName(name) === formatCountryName(targetName)
  );
};

const formatCountryName = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};
