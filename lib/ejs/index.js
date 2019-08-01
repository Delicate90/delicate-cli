const path = require('path');

module.exports = {
    "config-overrides.js": path.resolve(__dirname, './config-overrides.ejs'),
    "src/index.js": path.resolve(__dirname, './src/index.ejs')
};