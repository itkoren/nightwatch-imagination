'use strict';

const Eyes = require('eyes.images').Eyes;
const util = require('util');
const events = require('events');

function EyesOpenAction() {
    events.EventEmitter.call(this);
}

util.inherits(EyesOpenAction, events.EventEmitter);

EyesOpenAction.prototype.command = function (apiKey, eyesWrapper, appName, testName, viewport, hostOS, hostingApp, done) {
    const eyes = new Eyes();
    eyes.setApiKey(apiKey);
    eyes.setHostOS(hostOS);
    eyes.setHostingApp(hostingApp);
    eyes.open(appName, testName, viewport).then(() => {
        eyesWrapper.set(eyes);
        done && done(eyes);
        return this.emit('complete');
    });

    return this;
};

module.exports = EyesOpenAction;
