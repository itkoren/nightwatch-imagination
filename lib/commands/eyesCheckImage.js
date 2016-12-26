'use strict';

const fs = require('fs');
const util = require('util');
const events = require('events');

function EyesCheckImageAction() {
    events.EventEmitter.call(this);
}

util.inherits(EyesCheckImageAction, events.EventEmitter);

EyesCheckImageAction.prototype.command = function (eyesWrapper, file, tag, done) {
    const context = this;
    let base64Image;

    try {
        let originalData = fs.readFileSync(file);
        base64Image = new Buffer(originalData, 'binary');
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`);
        return context.emit('complete');
    }

    eyesWrapper.get().checkImage(base64Image, tag).then(res => {
        done && done(res);
        return this.emit('complete');
    });

    return this;
};

module.exports = EyesCheckImageAction;
