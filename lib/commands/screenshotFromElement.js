'use strict';

const util = require('util');
const events = require('events');
const fs = require('fs-extra');
const path = require('path');
const gm = require('gm');
const utils = require('../utils');

function getElementPosition(selector) {
    /*global document window*/
    /*eslint no-undef: "error"*/
    var el = document && document.querySelector(selector);
    var rect = el && el.getBoundingClientRect();
    var ratio = window && window.devicePixelRatio || 1;

    if (document) {
        // hide scrollbar for better diffs
        document.body.style.overflow = 'hidden';
    }

    return {
        height: rect.height * ratio,
        width: rect.width * ratio,
        left: rect.left * ratio,
        top: rect.top * ratio
    };
}

function initializeCache(config, filepath, fixedName) {
    const cache = config.cache[fixedName] || {};
    const indexFile = path.join(filepath, 'index.json');

    if (fs.existsSync(indexFile)) {
        cache.src = fs.readJsonSync(indexFile);
    }
    else if (!cache.src) {
        cache.src = [];
    }

    if (!cache.add) {
        cache.filepath = filepath;
        config.cache[fixedName] = cache;
        cache.add = (position, cb) => {
            cache.src.push(position);
            fs.outputJson(indexFile, cache.src, cb);
        };
    }

    return cache;
}

function takeScreenshot(config, { position, imageData, selector, uniqueName, baseline }, done) {
    uniqueName = uniqueName ? utils.normalize(uniqueName) : utils.normalize(selector);
    const fixedName = `${this.currentTest.module}_${utils.normalize(this.currentTest.name)}__${uniqueName}`;
    const filepath = path.join(config.path, fixedName);

    let ref = path.join(filepath, '_ref.png');

    if ('string' === typeof config.ref) {
        ref = path.join(filepath, config.ref + '.png');
    }

    if (config.ref && !fs.existsSync(ref)) {
        throw new Error('Missing reference ' + ref);
    }

    const loadImage = gm.subClass({imageMagick: !config.gm});
    const indexedImages = initializeCache(config, filepath, fixedName);
    const imageChunk = path.join(filepath, 'ref.' + indexedImages.src.length + '.png');

    fs.outputFileSync(imageChunk, new Buffer(imageData, 'base64'));

    if (position) {
        const shot = loadImage(imageChunk).quality(100);

        shot.crop(position.width, position.height, position.left, position.top);

        shot.write(imageChunk, err => {
            if (err) {
                throw err;
            }

            position.file = imageChunk;
            if (baseline || !indexedImages.src.length) {
                position.baseline = true;
            }

            indexedImages.add(position, done);
        });
    }
    else {
        position = {};
        position.file = imageChunk;
        if (baseline || !indexedImages.src.length) {
            position.baseline = true;
        }

        indexedImages.add(position, done);
    }

    return imageChunk;
}

function ScreenshotFromElement() {
    events.EventEmitter.call(this);
}

util.inherits(ScreenshotFromElement, events.EventEmitter);

ScreenshotFromElement.prototype.command = function (config, options, done) {
    let position;
    const context = this;

    if ('function' === typeof options && 'undefined' === typeof done) {
        done = options;
        options = config;
        config = {};
    }

    let { selector, uniqueName, baseline } = options;

    const parsedConfig = utils.buildConfig(this.client.options, config);

    if (selector) {
        this.client.api.execute(getElementPosition, [selector], data => {
            position = data.value;
        });
    }

    this.client.api.pause(config.timeout || 1000)
        .perform((api, cb) => {
            api.screenshot(false, result => {
                let imageData = result.value;
                let file = takeScreenshot.call(this.client.api, parsedConfig, { position, imageData, selector, uniqueName, baseline }, () => {
                    cb.call(context);
                    done && done(file);
                    context.emit('complete');
                });
            });
        });

    return this;
};

module.exports = ScreenshotFromElement;
