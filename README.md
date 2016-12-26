**nightwatch-imagination** is a "plugin" for [NightwatchJS](http://nightwatchjs.org/) which allows CSS Regression tests.

It's based on [gm](https://www.npmjs.com/package/gm) for GraphicsMagick/ImageMagick support and on Version 2 of [Resemble.js](https://www.npmjs.com/package/node-resemble-v2) (for NodeJS) for screenshot comparison.
It also supports remote management of screenshots baselines and screenshot comparison using [aplitools](https://applitools.com/)

## Installation
```
npm i nightwatch-imagination -S
```

## Initialization
```javascript
const settings = require('../../Settings');
require('nightwatch-imagination').init(settings);
```

Initialization should happen during bootstrap and before the tests begin to run.

After initializing with `init()` you can use the assertion `isVisualMatching()` within your tests:

```javascript
module.exports = {
  'Ensure "form" is visually consistent': function(browser) {
    // defaults
    const config = {
        gm: true, // disable GraphicsMagick and use ImageMagick instead
        ref: false, // always compare against solid references (_ref.png)
        path: 'screenshots', // relative from CWD or absolute from everywhere
        remote: false // Use local comparison instead or aplitools remote comparison
    };
    browser.initScreenshotComparison(); // Initialize a new comparison session
    browser.assert.isVisualMatching(config, {
        selector: 'form', // The selector of the element to take screenshot of
        uniqueName: 'myName', // A unique name for this baseline screenshot image
        threshold: 1.3 // The image diff threshold which should be accepted
    }); // Check Visual Change Assertion
    browser.closeScreenshotComparison(); // Close the comparison session
  }
};
```

## Why use this tool?

**nightwatch-imagination** leverages NightwatchJS (Webdriver &rarr; Selenium) so you can compare screenshots from multiple browser types.

Screenshot comparison can be managed and performed locally or using remote management of screenshots baselines and comparisons using [aplitools](https://applitools.com/)
