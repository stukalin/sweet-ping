#!/usr/bin/env node
const program = require('commander');
const axios = require('axios');
const moment = require('moment');
const {error, info, success} = require('./util/logger');

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

makePing(url);

async function makePing(url) {
    let failureStart;
    let successStart;

    while (true) {
        try {
            const response = await axios.get(url);
            if (!successStart) {
                info(`Received response with the code ${response.status}`);
            } else {
                process.stdout.write('.');
            }

            if (!successStart) {
                successStart = moment();
            }

            if (failureStart) {
                let timeDiff = moment.duration(moment().diff(failureStart));
                success(`There was a website outage which lasted ~${timeDiff.asSeconds()} seconds`);
                failureStart = null;
            }
        } catch (e) {
            if (e.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (!failureStart) {
                    error(`Server responded with the status ${e.response.status}`);
                    successStart = null;
                } else {
                    process.stdout.write('.');
                }
            } else {
                error(`There was some error ${e}`);
            }

            if (!failureStart) {
                failureStart = moment();
            }

        }
    }
}
