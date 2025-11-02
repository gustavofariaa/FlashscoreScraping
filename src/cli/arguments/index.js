import { FileTypes } from "../../constants/index.js";

export const parseArguments = () => {
  const args = process.argv.slice(2);
  const options = {
    country: null,
    league: null,
    headless: "shell",
    fileType: null,
  };

  args.forEach((arg) => {
    if (arg.startsWith("country=")) options.country = arg.split("=")[1];
    if (arg.startsWith("league=")) options.league = arg.split("=")[1];
    if (arg.startsWith("fileType=")) options.fileType = arg.split("=")[1];
    if (arg === "no-headless") options.headless = false;
  });

  if (options.fileType) {
    const userInput = options.fileType;
    const matchedType = Object.values(FileTypes).find(
      (type) => type.argument === userInput
    );

    if (!matchedType) {
      const acceptedTypes = Object.values(FileTypes)
        .map((type) => `"${type.argument}"`)
        .join(", ");
      throw Error(
        `❌ Invalid fileType: "${userInput}"\n` +
          `Accepted file types are: ${acceptedTypes}`
      );
    }

    options.fileType = matchedType;
  }

  if (options.league && !options.country) {
    throw Error(
      `❌ Missing required argument: country=<country-name>\n` +
        `You provided a league "${options.league}" but did not specify a country\n` +
        `Usage example: country=<country-name> league=<league-name>`
    );
  }

  return options;
};
