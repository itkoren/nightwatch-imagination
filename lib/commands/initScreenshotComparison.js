'use strict';

const util = require('util');
const events = require('events');
const utils = require('../utils');

function InitScreenshotComparison() {
    events.EventEmitter.call(this);
}

util.inherits(InitScreenshotComparison, events.EventEmitter);

InitScreenshotComparison.prototype.command = function (options, hostOS, hostingApp, done) {
    const context = this;
    const screenshots = utils.getNestedAttributeValue(this.client.api.globals.test_settings, 'screenshots');
    const desiredCapabilities = utils.getNestedAttributeValue(this.client.api.globals.test_settings, 'desiredCapabilities');

    if (utils.isEnabled(this.client.api, options) && utils.isRemote(this.client.api, options)) {
        if (!screenshots) {
            throw new TypeError('Something went wrong! expected screenshots configuration could not be found');
        }

        if (!screenshots.apiKey) {
            throw new TypeError('Something went wrong! expected screenshots.apiKey configuration could not be found');
        }

        this.apiKey = screenshots.apiKey;
        this.appName = utils.normalize(this.client.api.currentTest.module);
        this.testName = utils.normalize(this.client.api.currentTest.name);
        this.viewport = options || screenshots.window_size || { width: 1024, height: 768 };
        this.hostOS = hostOS || desiredCapabilities.platform || 'darwin';
        this.hostingApp = hostingApp || desiredCapabilities.browserName || 'chrome';
        this.eyesWrapper = {
            get: () => this.eyes,
            set: eyes => {
                this.eyes = eyes;
            }
        };

        screenshots.context = {
            apiKey: this.apiKey,
            appName: this.appName,
            testName: this.testName,
            viewport: this.viewport,
            hostOS: this.hostOS,
            hostingApp: this.hostingApp,
            eyesWrapper: this.eyesWrapper
        };

        screenshots.context.eyesWrapper = this.eyesWrapper;
        this.client.api.eyesOpen(this.apiKey, this.eyesWrapper, this.appName, this.testName, this.viewport, this.hostOS, this.hostingApp, () => {
            done && done.call(context);
            context.emit('complete');
        });
    }
    else {
        setImmediate(() => {
            done && done.call(context);
            context.emit('complete');
        });
    }

    return this;
};

module.exports = InitScreenshotComparison;
