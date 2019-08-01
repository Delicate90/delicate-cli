#!/usr/bin/env node
const commander = require('commander');
const package = require('./package');
const chalk = require('chalk');
const Initializer = require('./lib/Initializer');

commander.version(package.version).usage('<command> [options]');

commander.command('init [project-name]')
    .option('-d, --default', 'skip prompts and use default preset.')
    .description('create new project...')
    .alias('i')
    .action(async (name, cmd)=> {
    const arguments = process.argv.slice(3);
    if (arguments.length > 1) {
        console.log(chalk.cyan(`⚙you provided more then one argument. The first one ${chalk.red('\"'+commander.args[0]+'\"')} will be used as your projectl\'s name, the rest are ignored.`))
    }
    const initializer = new Initializer(cmd);
    await initializer.init(arguments);
});

commander.parse(process.argv);

if (commander.args.length === 0) {
    console.log(`enter --help or -h to receive more document for delicate-cli.`);
    commander.help();
}