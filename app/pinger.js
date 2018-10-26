const axios = require('axios');
const moment = require('moment');
const {error, info, success, warn} = require('../util/logger');
const sleep = require('../util/sleep');
const chalk = require('chalk');

const reportRequestTimeDevianceAtPercent = 100;

const Pinger = {
    async makePing(url) {
        let failureStart;
        let successStart;
        let numberOfGoodRequests = 0;
        let sumOfGoodTimes = 0;

        // noinspection InfiniteLoopJS
        while (true) {
            try {
                let start = moment();
                const response = await axios.get(url, {
                    timeout: 5000
                });

                // calculate timing statistics
                let reqTime = moment.duration(moment().diff(start)).asMilliseconds();
                if (sumOfGoodTimes) {
                    let avg = sumOfGoodTimes / numberOfGoodRequests;
                    let deviance = (reqTime - avg) / avg;
                    if (deviance > reportRequestTimeDevianceAtPercent / 100) {
                        warn(`The request time was (${reqTime.toFixed()}ms) which is ${(deviance * 100).toFixed()}% of average (${avg.toFixed()}ms)`);
                    }
                }

                numberOfGoodRequests++;
                sumOfGoodTimes+=reqTime;

                if (!successStart) {
                    successStart = moment();
                    info(`Received response with the code ${response.status}`);
                } else {
                    process.stdout.write('.');
                }

                if (failureStart) {
                    let timeDiff = moment.duration(moment().diff(failureStart));
                    success(`There was a website outage which lasted ~${timeDiff.asSeconds().toFixed()} seconds`);
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
                        process.stdout.write(chalk.red('.'));
                    }
                } else if(e.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    if (!failureStart) {
                        error(`No response was received ${e.request}`);
                        successStart = null;
                    } else {
                        process.stdout.write(chalk.red('.'));
                    }
                }
                else {
                    error(`There was some error ${e.message}`);
                }

                if (!failureStart) {
                    failureStart = moment();
                }
            }

            await sleep(100);
        }
    }
};


module.exports = Object.create(Pinger);