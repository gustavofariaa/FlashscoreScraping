import { FileTypes } from '../../constants/index.js';

export const parseArguments = () => {
  const args = process.argv.slice(2);
  const options = {
    country: null,
    league: null,
    headless: 'shell',
    fileType: null,
  };

  args.forEach((arg) => {
    if (arg.startsWith('country=')) options.country = arg.split('=')[1];
    if (arg.startsWith('league=')) options.league = arg.split('=')[1];
    if (arg.startsWith('fileType=')) options.fileType = arg.split('=')[1];
    if (arg === 'no-headless') options.headless = false;
  });

  if (options.fileType) {
    const current = options.fileType;
    options.fileType = Object.values(FileTypes).find((type) => type.argument === options.fileType);
    if (!options.fileType) {
      const acceptedTypes = Object.values(FileTypes)
        .map((type) => `"${type.argument}"`)
        .join(', ');
      console.error(`❌ ERROR: Invalid fileType=${current}\nAccepted types are: ${acceptedTypes}\n`);
      process.exit(1);
    }
  }

  return options;
};
