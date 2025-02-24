import inquirer from 'inquirer';

export const selectFileType = async () => {
  const options = ['json', 'csv'];
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select a output file type:',
      choices: ['json', 'csv', 'Cancel'],
    },
  ]);

  if (choice === 'Cancel') {
    console.log('No option selected. Exiting...');
    process.exit(1);
  }

  return options.find((element) => element === choice);
};
