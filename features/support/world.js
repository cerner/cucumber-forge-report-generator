const { setWorldConstructor, After } = require('cucumber');
const { JSDOM } = require('jsdom');
const fs = require('fs');

class CustomWorld {
  constructor() {
    this.featureFiles = [];
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

/* eslint-disable func-names */
After(function () {
// Clean up any feature files that got written.
  return this.featureFiles.forEach(filePath => fs.unlinkSync(filePath));
});

setWorldConstructor(CustomWorld);
