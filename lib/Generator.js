const path = require("path");
const fs = require("fs");
const fsExtra = require('fs-extra');
const inquirer = require("inquirer");
const chalk = require("chalk");
const execa = require('execa');
const ejs = require('ejs');
const rm = require('rimraf').sync;
const {getPluginModules} = require('./plugins');
const {lineLoadingStart, lineLoadingEnd, wait} = require('./util/commander');
const ejsObject = require('./ejs');

module.exports = class Generator {
    constructor(initializer) {
        this.initializer = initializer
    }

    async generate() {
        try {
            const {prompts = {}, options} = this.initializer;
            const {projectName, plugins = [], port = 2019} = prompts;
            //校验文件夹
            await this.checkReBuildPath(projectName);
            const lineGenerator = lineLoadingStart('  generating');
            const pluginModules = getPluginModules(plugins);
            this.pkg = this.initPackage(projectName, pluginModules, port);
            fsExtra.mkdirpSync(this.buildPath);
            await this.copyTemplate();
            await this.generateEjs();
            await wait(1000);
            lineLoadingEnd(lineGenerator, ` generate success!`);
            process.chdir(this.buildPath);
            const lineInstall = lineLoadingStart('  installing');
            const res = await execa('npm', ['install']);
            lineLoadingEnd(lineInstall, ` install success!`);
            console.log(`👉 cd ${projectName} && yarn start`);
            console.log(chalk.blue('---------- done ----------'));
        }catch (e) {
            console.error(e)
        }
    }

    async checkReBuildPath(projectName) {
        const to = path.resolve(process.cwd(), projectName);
        if (fs.existsSync(to)) {
            const {result} = await inquirer.prompt([{
                type: 'list',
                message: chalk.yellow(`  dict ${chalk.red('\"'+projectName+'\"')} already exists. remove & rebuild?`),
                name: 'result',
                choices: ['yes', 'no']
            }]);
            if ('yes' === result) {
                const lineClean = lineLoadingStart('  cleaning');
                await wait(1000);
                await rm(to);
                lineLoadingEnd(lineClean, ` clean success!`);
            }else {
                console.log(`exit.`);
                process.exit(0)
            }
        }
        this.buildPath = to;
    }

    initPackage(projectName, pluginModules = [], port) {
        const pkg = {
            name: projectName,
            version: '0.0.1',
            license: 'MIT',
            dependencies: pluginModules.reduce((prev, current)=>({...prev, ...current.dependencies}), {}),
            devDependencies: pluginModules.reduce((prev, current)=>({...prev, ...current.devDependencies}), {}),
            scripts: {
                start: `PORT=${port} react-scripts start`
            }
        };
        return pkg
    }

    async generateEjs() {
        const options = {plugins: {}};
        this.initializer.prompts.plugins.map(p=>options.plugins[p] = true);
        const ejsFiles = await Object.keys(ejsObject).map(k=>{
            let templateStr = fsExtra.readFileSync(ejsObject[k]).toString();
            templateStr = ejs.render(templateStr, options);
            return {
                path: k,
                templateStr
            }
        }).filter(f=>f.templateStr);
        ejsFiles.map(file=>{
            fsExtra.writeFileSync(path.resolve(this.buildPath, file.path), file.templateStr);
        });
    }

    async copyTemplate() {
        const templatePath = path.resolve(__dirname, 'template');
        const pkgPath = path.resolve(this.buildPath, 'package.json');
        fsExtra.copySync(templatePath, this.buildPath);
        fsExtra.writeJsonSync(pkgPath, this.pkg, {spaces: 2});
    }
};