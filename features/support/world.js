const { setWorldConstructor, After } = require('cucumber');
const { JSDOM } = require('jsdom');
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
  }

  setOutput(output) {
    this.output = output;
    if (this.output.length > 0) {
      this.window = new JSDOM(this.output, { runScripts: 'dangerously', pretendToBeVisual: true }).window;
      this.outputHTML = this.window.document;
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

After(function () {
  // Clean up any feature files that got written.
  this.featureFiles.forEach((filePath) => fs.unlinkSync(filePath));
  this.featureDirs.forEach((featureDir) => fs.rmdirSync(featureDir));
});

setWorldConstructor(CustomWorld);
