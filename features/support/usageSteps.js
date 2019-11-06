const path = require('path');
const {
  Given, When, Then,
} = require('cucumber');
const { expect } = require('chai');

const Generator = require('../../src/Generator');

Given('there is a report for the following feature files:', function (featureFilesTable) {
  const getPath = fileName => path.resolve(__dirname, fileName[0]);
  const filePaths = featureFilesTable.raw().map(getPath);
  return new Generator().generate(filePaths).then(report => this.setOutput(report));
});

Given('there is a report for the feature file {string}', function (featureFile) {
  const filePath = path.resolve(__dirname, featureFile);
  return new Generator().generate([filePath]).then(report => this.setOutput(report));
});

When('the second feature button is clicked', function () {
  const featureButton = this.outputHTML.getElementsByClassName('feature-button')[1];
  const scrolledElement = this.outputHTML.getElementById(featureButton.getAttribute('scroll-to-id'));
  scrolledElement.scrollIntoView = () => { this.scrolledIntoView = scrolledElement; };
  featureButton.click();
});

When(/^the (first|second) scenario button is clicked$/, function (scenarioIndex) {
  const index = scenarioIndex === 'first' ? 0 : 1;
  const scenarioButton = this.getScenarioButtonByIndex(index);
  const scrolledElement = this.outputHTML.getElementById(scenarioButton.getAttribute('scroll-to-id'));
  // Mock the scrollIntoView call
  scrolledElement.scrollIntoView = () => { this.scrolledIntoView = scrolledElement; };
  scenarioButton.click();
});

When(/^the (first|second) scenario is scrolled into view$/, function (scenarioIndex) {
  const index = scenarioIndex === 'first' ? 0 : 1;
  const activeFeature = this.outputHTML.getElementsByClassName('feature-wrapper active')[0];
  const scenarioAnchors = Array.from(activeFeature.getElementsByClassName('anchor')).filter(anchor => anchor.hasAttribute('scenario-button'));
  const scenarioAnchor = scenarioAnchors[index];
  // To simulate scrolling, set the active class on our desired anchor
  // and then trigger the scroll event.
  scenarioAnchor.classList.add('active');
  Array.from(this.outputHTML.getElementsByClassName('anchor')).some((anchor) => {
    if (scenarioAnchor !== anchor) {
      anchor.classList.remove('active');
      return false;
    }
    return true;
  });
  const scrollEvt = this.outputHTML.createEvent('HTMLEvents');
  scrollEvt.initEvent('scroll', false, true);
  this.outputHTML.body.dispatchEvent(scrollEvt);
});

When('the settings button is clicked', function () {
  this.outputHTML.getElementById('settingsButton').click();
});

When('the box is checked to show tags', function () {
  this.outputHTML.getElementById('tagsCheckbox').click();
});

Then(/^the (first|second) feature (?:is|will be) displayed$/, function (featureIndex) {
  const index = featureIndex === 'first' ? 0 : 1;
  const featureWrappers = this.outputHTML.getElementsByClassName('feature-wrapper');
  const selectedFeatureWrapper = featureWrappers[index];
  expect(selectedFeatureWrapper.classList.contains('active')).to.be.true;
  Array.from(featureWrappers).forEach((featureWrapper) => {
    if (selectedFeatureWrapper !== featureWrapper) {
      expect(featureWrapper.classList.contains('active')).to.be.false;
    }
  });
});

Then(/^the scenario buttons for the (first|second) feature (?:are|will be) expanded in the sidebar$/, function (featureIndex) {
  const index = featureIndex === 'first' ? 0 : 1;
  const featureButtons = this.outputHTML.getElementsByClassName('feature-button');
  const selectedFeatureButton = featureButtons[index];
  expect(selectedFeatureButton.classList.contains('active')).to.be.true;
  const scenarioPanel = selectedFeatureButton.nextElementSibling;
  expect(scenarioPanel.style.maxHeight).to.not.be.empty;
  const selectedIcon = selectedFeatureButton.getElementsByTagName('i')[0];
  expect(selectedIcon.classList.contains('fa-angle-down')).to.be.true;
  expect(selectedIcon.classList.contains('fa-angle-right')).to.be.false;

  Array.from(featureButtons).forEach((featureButton) => {
    if (selectedFeatureButton !== featureButton) {
      expect(featureButton.classList.contains('active')).to.be.false;
      const panel = featureButton.nextElementSibling;
      expect(panel.style.maxHeight).to.be.empty;
      const icon = featureButton.getElementsByTagName('i')[0];
      expect(icon.classList.contains('fa-angle-down')).to.be.false;
      expect(icon.classList.contains('fa-angle-right')).to.be.true;
    }
  });
});

Then(/^the (first|second) scenario button will be highlighted$/, function (scenarioIndex) {
  const index = scenarioIndex === 'first' ? 0 : 1;
  const selectedScenarioButton = this.getScenarioButtonByIndex(index);
  expect(selectedScenarioButton.classList.contains('active')).to.be.true;
  Array.from(this.outputHTML.getElementsByClassName('scenario-button')).forEach((scenarioButton) => {
    if (selectedScenarioButton !== scenarioButton) {
      expect(scenarioButton.classList.contains('active')).to.be.false;
    }
  });
});

Then(/^the (first|second) scenario will be scrolled into view$/, function (scenarioIndex) {
  const index = scenarioIndex === 'first' ? 0 : 1;
  const activeFeature = this.outputHTML.getElementsByClassName('feature-wrapper active')[0];
  const scenarioAnchors = Array.from(activeFeature.getElementsByClassName('anchor')).filter(anchor => anchor.hasAttribute('scenario-button'));
  expect(this.scrolledIntoView).to.eql(scenarioAnchors[index]);
});

Then(/^the settings drawer will be (displayed|hidden)$/, function (visibility) {
  const settingsDrawer = this.outputHTML.getElementById('settingsDrawer');
  const visibilityStatus = settingsDrawer.classList.contains('active');
  if('displayed' === visibility) {
    expect(visibilityStatus).to.be.true;
  } else {
    expect(visibilityStatus).to.be.false;
  }
});

Then('the tags displayed for the feature will be {string}', function (expectedTagString) {
  const activeFeature = this.outputHTML.getElementsByClassName('feature-wrapper active')[0];
  const actualTagString = activeFeature.getElementsByClassName('tags')[0].textContent;  
  expect(actualTagString.trim()).to.eql(expectedTagString);
});

Then('the tags displayed for the {word} scenario will be {string}', function (scenarioIndex, expectedTagString) {
  const activeFeature = this.outputHTML.getElementsByClassName('feature-wrapper active')[0].getElementsByClassName('feature-body')[0];
  const index = scenarioIndex === 'first' ? 0 : 1;
  const actualTagString = activeFeature.getElementsByClassName('tags')[index].textContent;  
  expect(actualTagString.trim()).to.eql(expectedTagString);
});