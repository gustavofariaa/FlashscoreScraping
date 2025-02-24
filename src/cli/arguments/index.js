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

  return options;
};
