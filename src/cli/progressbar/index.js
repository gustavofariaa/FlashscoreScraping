import cliProgress from 'cli-progress';

export const initializeProgressbar = (total) => {
  const progressbar = new cliProgress.SingleBar({
    format: 'Progress: {bar} | {percentage}% | {value}/{total} matches',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  console.info('');
  progressbar.start(total, 0);
  return progressbar;
};
