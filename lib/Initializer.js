const inquirer = require('inquirer');
const chalk = require('chalk');
const plugins = require('./plugins');
const {optionsGenerator, clear} = require('./util/commander');
const Generator = require('./Generator');

module.exports = class Initializer {

    constructor(cmd = {}) {
        this.options = optionsGenerator(cmd);
    }

    async init(agruments = []) {
        await clear();
        console.log(chalk.blue('------ delicate-cli ------'));
        console.log('🌟️project init start...');
        this.prompts = {};
        this.prompts.projectName = agruments[0];
        if (this.options.default && this.prompts.projectName) {
            this.prompts.plugins = plugins.names;
            this.prompts.port = '2019';
        } else {
            const promptConfigs = [];
            if (!this.prompts.projectName) {
                promptConfigs.push({
                    type: 'input',
                    message: chalk.yellow('  enter your project name ->'),
                    name: 'projectName',
                    validate: input => !input && `please enter your project name!`
                })
            }
            if (plugins.names.length > 0) {
                promptConfigs.push({
                    type: 'checkbox',
                    message: chalk.yellow('  select plugins for your project ->'),
                    name: 'plugins',
                    choices: plugins.names
                })
            }
            promptConfigs.push({
                type: 'number',
                message: chalk.yellow('  enter port for dev server ->'),
                name: 'port',
                default: 2019
            });
            this.prompts = {...this.prompts, ...await inquirer.prompt(promptConfigs)};
        }
        const generator = new Generator(this);
        await generator.generate();
    };
};