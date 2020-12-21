const { setWorldConstructor, After, Before } = require('cucumber');
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');

class CustomWorld {
  constructor() {
    this.featureFiles = [];
    this.featureDirs = [];
    this.output = null;
    this.window = null;
    this.outputHTML = null;
    this.tag = null;
    this.scrolledIntoView = null;
    this.exceptionScenario = false;
  }

  createWindow(url, outputConsole) {
    const virtualConsole = new VirtualConsole();
    if (outputConsole) {
      virtualConsole.sendTo(outputConsole);
    }
    this.window = new JSDOM(this.output, {
      url, virtualConsole, runScripts: 'dangerously', pretendToBeVisual: true,
    }).window;
    this.outputHTML = this.window.document;
  }

  setOutput(output) {
    this.output = output;
    if (this.output.length > 0) {
      this.createWindow('https://localhost/', console);
    } else {
      this.window = null;
      this.outputHTML = null;
    }
  }

  getScenarioButtonByIndex(index) {
    const activeFeatureButton = this.outputHTML.getElementsByClassName('feature-button active')[0];
    const scenarioPanel = activeFeatureButton.nextElementSibling;
    return scenarioPanel.getElementsByClassName('scenario-button')[index];
  }
}

Before({ tags: '@exception' }, function () {
  this.exceptionScenario = true;
});

After(function () {
  // Clean up any feature files that got written.
  this.featureFiles.forEach((filePath) => fs.unlinkSync(filePath));
  this.featureDirs.reverse().forEach((featureDir) => fs.rmdirSync(featureDir));
});

setWorldConstructor(CustomWorld);
