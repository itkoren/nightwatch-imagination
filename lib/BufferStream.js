'use strict';

const Readable = require('stream').Readable;

class BufferStream extends Readable {
    constructor(source) {
        if (!Buffer.isBuffer(source)) {
            throw new Error('Source must be a buffer!');
        }

        // Super
        super();

        this._source = source;
        this._offset = 0;
        this._length = source.length;

        this.on('end', this._destroy);
    }

    _destroy() {
        this._source = null;
        this._offset = null;
        this._length = null;
    }

    _read(size) {
        if (this._offset < this._length) {
            this.push(this._source.slice(this._offset, (this._offset + size)));
            this._offset += size;
        }

        if (this._offset >= this._length) {
            this.push(null);
        }
    }
}

module.exports = BufferStream;
