'use strict';

const path = require('path');

function init(settings) {
    const assert = path.join(__dirname, 'assertions');
    const command = path.join(__dirname, 'commands');

    settings.custom_assertions_path = settings.custom_assertions_path || [];
    settings.custom_commands_path = settings.custom_commands_path || [];

    if (!settings.custom_assertions_path.includes(assert)) {
        settings.custom_assertions_path.push(assert);
    }

    if (!settings.custom_commands_path.includes(command)) {
        settings.custom_commands_path.push(command);
    }
}

module.exports = {
    init
};
