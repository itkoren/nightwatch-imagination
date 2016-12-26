'use strict';

const args = require('minimist')(process.argv);

function isTrue(value) {
    return 'undefined' !== typeof value && !!value;
}

function isFalse(value) {
    return 'undefined' !== typeof value && !value;
}

function arrayWaterfallGetBooleanValue(array) {
    for (let i = 0; i < array.length; i++) {
        if (isTrue(array[i])) {
            return true;
        }
        else if (isFalse(array[i])) {
            return false;
        }
    }

    return true;
}

function normalize(name) {
    return name.replace(/[^\w()._-]+/g, '_').replace(/\.+$|^\W+/g, '');
}

function buildConfig(client, options) {
    const conf = Object.assign({}, client.globals.test_settings.screenshots,  options || {}, args);

    let { gm, ref, path, cache } = conf;

    return {
        gm: 'undefined' !== typeof gm ? gm : true,
        ref: 'undefined' !== typeof ref ? ref : false,
        path: 'undefined' !== typeof path ? path : 'screenshots',
        cache: 'undefined' !== typeof cache ? cache : void 0
    };
}

function isEnabled(client, options) {
    return arrayWaterfallGetBooleanValue([
        args.screenshotsEnabled,
        options && options.enabled,
        client.globals.test_settings.screenshots && client.globals.test_settings.screenshots.enabled
    ]);
}

function isRemote(client, options) {
    return arrayWaterfallGetBooleanValue([
        args.screenshotsRemote,
        options && options.remote,
        client.globals.test_settings.screenshots && client.globals.test_settings.screenshots.remote
    ]);
}

function getNestedAttributeValue(obj /*, level1, level2, ... levelN*/) {
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < args.length; i++) {
        if (!obj || !obj.hasOwnProperty(args[i])) {
            return false;
        }

        obj = obj[args[i]];
    }

    return obj;
}

module.exports = {
    normalize,
    buildConfig,
    isEnabled,
    isRemote,
    getNestedAttributeValue
};
