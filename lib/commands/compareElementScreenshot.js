'use strict';

const util = require('util');
const events = require('events');
const fs = require('fs-extra');
const path = require('path');
const resemble = require('node-resemble-v2');
const utils = require('../utils');
const BufferStream = require('../BufferStream');

function retrieveCache(config, uniqueName, fixedName) {
    const cache = config.cache[uniqueName] || config.cache[fixedName];

    if (cache && ((cache.src.length > 1) || config.ref)) {
        const a = config.ref ? '_ref' : (cache.src.length - 2);
        const b = cache.src.length - 1;
        const baseline = cache.src.length && cache.src.findIndex(elem => {
                return elem.baseline;
            }) || 0;

        return {
            latest: path.join(cache.filepath, (config.ref ? a : `ref.${a}`) + '.png'),
            current: path.join(cache.filepath, `ref.${b}.png`),
            baseline: path.join(cache.filepath, `ref.${baseline}.png`),
            diff: {
                latest: path.join(cache.filepath, `ref.${b}_${a}.png`),
                baseline: path.join(cache.filepath, `ref.${b}_${baseline}.png`)
            }
        };
    }
}

function CompareElementScreenshot() {
    events.EventEmitter.call(this);
}

util.inherits(CompareElementScreenshot, events.EventEmitter);

CompareElementScreenshot.prototype.command = function(config, options, done) {
    const context = this;

    if ('function' === typeof options && 'undefined' === typeof done) {
        done = options;
        options = config;
        config = {};
    }

    let { selector, uniqueName, latest } = options;

    if (!selector) {
        throw new TypeError('compareElementScreenshot() expects a selector');
    }

    latest = latest || false;

    if ('function' !== typeof done) {
        throw new TypeError('compareElementScreenshot() expects a valid callback');
    }

    uniqueName = uniqueName ? utils.normalize(uniqueName) : utils.normalize(selector);
    const fixedName = `${this.client.api.currentTest.module}_${utils.normalize(this.client.api.currentTest.name)}__${uniqueName}`;
    const parsedConfig = utils.buildConfig(this.client.api, config);

    this.client.api
        .perform((api, cb) => {
            const diffImages = retrieveCache(parsedConfig, uniqueName, fixedName);
            const selected = latest ? 'latest' : 'baseline';

            if (!diffImages) {
                return done && done.call(this.client, {
                    pending: 'Nothing to compare, skipping screenshots comparison...'
                }, () => {
                    cb.call(context);
                    context.emit('complete');
                });
            }

            if (!fs.existsSync(diffImages.latest)) {
                throw new Error(`Missing latest reference ${diffImages.latest}`);
            }

            if (!fs.existsSync(diffImages.current)) {
                throw new Error(`Missing current reference ${diffImages.current}`);
            }

            resemble(diffImages.current)
                .compareTo(diffImages[selected])
                .scaleToSameSize()
                .onComplete(data => {
                    let regExMatches = data.getImageDataUrl().match('data:image/(.*);base64,(.*)');
                    let dataBuffer = new BufferStream(new Buffer(regExMatches[2], 'base64'));

                    dataBuffer
                        .pipe(fs.createWriteStream(diffImages.diff[selected]))
                        .on('finish', () => {
                            done && done.call(this.client, {
                                filepathDiff: diffImages.diff[selected],
                                imageDiff: data
                            }, () => {
                                cb.call(context);
                                context.emit('complete');
                            });
                        });
                });
        });

    return this;
};

module.exports = CompareElementScreenshot;
