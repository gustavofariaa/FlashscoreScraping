import inquirer from 'inquirer';

/**
 * Prompt user to select statistics period type
 * @returns {Promise<string>} Selected period ('fulltime' or 'all')
 */
export const selectPeriod = async () => {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'period',
      message: 'Select statistics period:',
      choices: [
        {
          name: 'Full Time',
          value: 'fulltime',
          short: 'Full Time'
        },
        {
          name: 'Full Time + 1st Half + 2nd Half',
          value: 'all',
          short: 'All Periods'
        }
      ],
      default: 'fulltime'
    }
  ]);

  return answer.period;
};