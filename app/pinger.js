const axios = require('axios');
const moment = require('moment');
const {error, info, success, warn} = require('../util/logger');
const sleep = require('../util/sleep');

const reportRequestTimeDevianceAtPercent = 100;

const Pinger = {
    async makePing(url) {
        let failureStart;
        let successStart;
        let numberOfGoodRequests = 0;
        let sumOfGoodTimes = 0;

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
                        warn(`The request time was (${reqTime}ms) which is ${deviance * 100}% of average (${avg}ms)`);
                    }
                }

                numberOfGoodRequests++;
                sumOfGoodTimes+=reqTime;

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

            await sleep(100);
        }
    }
};


module.exports = Object.create(Pinger);