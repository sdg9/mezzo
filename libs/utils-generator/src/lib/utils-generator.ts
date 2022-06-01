import * as inquirer from 'inquirer';

export async function promptCharles() {
  const answer = await inquirer.prompt([
    {
      name: 'useCharlesFile',
      type: 'list',
      message: 'Want to use a Charles file?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
    },
    {
      name: 'charlesFileExtension',
      type: 'input',
      message: '[example prompt] what is the charles extension?',
      filter: (value) => value.replace(/[']+/g, ''),
      when: (answers) => answers.useCharlesFile === true,
      validate: async (charlesPath) => {
        if (!charlesPath.includes('.chlsj')) {
          return 'Charles json export must end in .chlsj';
        }
        return true;
      },
    },
  ]);

  console.log('got my answers: ', answer);
}
