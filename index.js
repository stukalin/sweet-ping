#!/usr/bin/env node
const program = require('commander');
const pinger = require('./app/pinger');
const {error} = require('./util/logger');

let url;

program
    .arguments('<url>')
    .action(urlValue => {
        url = urlValue;
    })
    .parse(process.argv);

if (!url) {
    error('No URL provided');
    program.help();
    return;
}

pinger.makePing(url);