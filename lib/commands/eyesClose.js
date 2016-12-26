'use strict';

const util = require('util');
const events = require('events');

function EyesCloseAction() {
    events.EventEmitter.call(this);
}

util.inherits(EyesCloseAction, events.EventEmitter);

EyesCloseAction.prototype.command = function (eyesWrapper, throwException, done) {
    let passed = false;

    eyesWrapper.get().close(throwException).then(res => {
        passed = true;
        done && done(res);
        return this.emit('complete');
    }).error(err => {
        passed = true;
        done && done({err: err});
        return this.emit('complete');
    }).finally(() => {
        if (!passed) {
            done && done({passed: passed});
            return this.emit('complete');
        }
    });

    return this;
};

module.exports = EyesCloseAction;
