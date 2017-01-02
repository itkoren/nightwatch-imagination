'use strict';

const utils = require('../utils');

function assertion(config, options) {
    if ('undefined' === typeof options) {
        options = config;
        config = {};
    }

    config = config || {};
    config.cache = config .cache || {};

    let { selector, uniqueName, threshold, baseline, latest } = options;

    if (!selector) {
        throw new TypeError('assert.isVisualMatching() expects a selector');
    }

    if ('function' === typeof threshold) {
        threshold = void 0;
    }

    if ('function' === typeof uniqueName) {
        uniqueName = void 0;
    }

    threshold = parseFloat(threshold || 1.33);

    if (utils.isEnabled(this.api, config)) {
        if (utils.isRemote(this.api, config)) {
            this.message = `Testing if element <${selector}> is not as expected based on aplitools comparison`;
        }
        else {
            this.message = `Testing if element <${selector}> is under ${threshold}% of changes`;
        }
    }
    else {
        this.message = 'screenshots comparison is disabled';
    }

    this.expected = function() {
        if (utils.isEnabled(this.api, config)) {
            if (utils.isRemote(this.api, config)) {
                return true;
            }
            else {
                return `< ${threshold}`;
            }
        }
        else {
            return true;
        }
    };

    this.pass = function (value) {
        if (true === value || false === value || isNaN(value)) {
            return value;
        }

        return parseFloat(value) < parseFloat(threshold);
    };

    this.value = function (result) {
        if (result.disabled) {
            return true;
        }
        else if (result.pending) {
            this.message = result.pending;

            return true;
        }
        else if (!result.imageDiff) {
            return !!result.asExpected;
        }
        else {
            return result.imageDiff.misMatchPercentage;
        }
    };

    this.command = function (callback) {
        const name = uniqueName ? utils.normalize(uniqueName) : utils.normalize(selector);
        const tag = `${this.api.currentTest.module}_${utils.normalize(this.api.currentTest.name)}__${name}`;

        if (utils.isEnabled(this.api, config)) {
            if (utils.isRemote(this.api, config)) {
                let eyesWrapper = utils.getNestedAttributeValue(this.api.globals.test_settings, 'screenshots', 'context', 'eyesWrapper');

                if (!eyesWrapper) {
                    throw new TypeError('Something went wrong! expected eyesWrapper could not be found');
                }

                this.api
                    .screenshotFromElement(config, { selector, uniqueName, baseline }, file => {
                        this.api
                            .eyesCheckImage(eyesWrapper, file, tag, (result, done) => {
                                callback(result);
                                done && done();
                            });
                    });
            }
            else {
                this.api
                    .screenshotFromElement(config, { selector, uniqueName, baseline })
                    .compareElementScreenshot(config, { selector, uniqueName, latest }, (result, done) => {
                        callback(result);
                        done && done();
                    });
            }
        }
        else {
            setImmediate(() => {
                callback({ disabled: true });
            });
        }

        return this;
    };
}

module.exports.assertion = assertion;
