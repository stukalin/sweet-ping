const chalk = require('chalk');
const moment = require('moment');

function log(msg, color = 'visible') {
    console.log(chalk[color](`\n[${moment().format('LTS')}] ${msg}`));
}

function success(msg) {
    log(msg, 'green');
}

function info(msg) {
    log(msg);
}

function error(msg) {
    log(msg, 'red');
}

function warn(msg) {
    log(msg, 'yellow');
}

module.exports = {
    success,
    info,
    error,
    warn
};