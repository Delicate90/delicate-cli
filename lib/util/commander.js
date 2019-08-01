const ora = require('ora');
const chalk = require('chalk');

exports.optionsGenerator = cmd => {
    const res = {};
    cmd.options.map(opt=>{
        const key = opt.long.replace(/^--/, '');
        const __flag = typeof cmd[key];
        if (['function', 'undefined'].indexOf(__flag) === -1) {
            res[key] = cmd[key];
        }
        return opt
    });
    return res
};

exports.lineLoadingStart = (text) => {
    return ora(chalk.magenta(text+'...')).start();
};

exports.lineLoadingEnd = (key, text)=> {
    key.succeed(chalk.green(text));
};

exports.clear = async _=> {
    await process.stdout.write('\033[2J');
};

exports.wait = async time=> {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
};