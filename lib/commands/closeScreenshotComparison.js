'use strict';

const util = require('util');
const events = require('events');
const utils = require('../utils');

function CloseScreenshotComparison() {
    events.EventEmitter.call(this);
}

util.inherits(CloseScreenshotComparison, events.EventEmitter);

CloseScreenshotComparison.prototype.command = function (throwException = true, done) {
    const context = this;

    if ('function' === typeof throwException) {
        done = throwException;
        throwException = true;
    }

    this.throwException = throwException;

    let eyesWrapper = utils.getNestedAttributeValue(this.client.api.globals.test_settings, 'screenshots', 'context', 'eyesWrapper');
    if (eyesWrapper) {
        this.client.api.eyesClose(eyesWrapper, this.throwException, () => {
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

module.exports = CloseScreenshotComparison;
