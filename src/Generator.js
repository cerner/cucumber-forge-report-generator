const dirTree = require('directory-tree');
const fs = require('fs');
const handlebars = require('handlebars');
const i18n = require('i18next');
const i18nBackend = require('i18next-node-fs-backend');
const moment = require('moment');
const os = require('os');
const path = require('path');

const FILE_ENCODING = 'utf-8';
const LANGUAGE = 'en';
const TEMPLATESDIR = 'templates';
const DEFAULT_REPORT_NAME = 'All Scenarios';

let author;
let sidenavButtonsTemplate;
let docHbTemplate;
let featureHbTemplate;
let cssStyles;
let scripts;
let logo;
let cog;

let projectName = 'Feature documentation';
let reportName = DEFAULT_REPORT_NAME;
let tagFilter = null;
let idSequence = 1;

const lineStartsWithI18n = (line, i18nkey) => line.startsWith(i18n.t(i18nkey));

const stepStarting = (line) => lineStartsWithI18n(line, 'given') || lineStartsWithI18n(line, 'when')
    || lineStartsWithI18n(line, 'then') || lineStartsWithI18n(line, 'and')
    || lineStartsWithI18n(line, 'but') || line.trim().startsWith('*');

const createScenario = (name, tags) => {
  const scenario = {};
  scenario.name = name;
  scenario.description = '';
  scenario.tags = tags;
  scenario.steps = [];
  return scenario;
};

const createExamples = (line) => {
  const examples = {};
  examples.name = line;
  examples.table = [];
  return examples;
};

const createStep = (name) => {
  const step = {};
  step.name = name;
  step.table = [];
  step.docString = '';
  return step;
};

const getNewPhase = (line) => {
  if (lineStartsWithI18n(line, 'feature')) {
    return 'FEATURE_STARTED';
  }
  if (lineStartsWithI18n(line, 'background')) {
    return 'BACKGROUND_STARTED';
  }
  if (lineStartsWithI18n(line, 'scenario')) {
    return 'SCENARIO_STARTED';
  }
  if (lineStartsWithI18n(line, 'scenario_outline')) {
    return 'SCENARIO_OUTLINE_STARTED';
  }
  if (lineStartsWithI18n(line, 'examples')) {
    return 'EXAMPLES_STARTED';
  }
  if (line === '\'\'\'' || line === '"""') {
    return 'DOC_STRING_STARTED';
  }
  return null;
};

const getFeatureFromFile = (featureFilename) => {
  const feature = {};
  feature.scenarios = [];
  feature.tags = [];
  feature.description = '';
  let scenario = null;
  let tags = [];

  let currentPhase = null;

  const fileLines = fs.readFileSync(featureFilename, FILE_ENCODING).replace('\r\n', '\n').split('\n');
  fileLines.forEach((nextLine) => {
    const line = nextLine.trim();
    const newPhase = getNewPhase(line);
    if (currentPhase === 'DOC_STRING_STARTED') {
      if (newPhase === 'DOC_STRING_STARTED') {
        // Reached the end of the doc string
        currentPhase = null;
      } else {
        const step = scenario.steps[scenario.steps.length - 1];
        // Use untrimmed nextLine to preserve whitespace
        step.docString += step.docString ? `\n${nextLine}` : nextLine;
      }
    } else if (newPhase) {
      currentPhase = newPhase;
      switch (newPhase) {
        case 'FEATURE_STARTED':
          feature.name = line;
          break;
        case 'BACKGROUND_STARTED':
          scenario = createScenario(line, tags);
          feature.background = scenario;
          tags = [];
          break;
        case 'SCENARIO_STARTED':
        case 'SCENARIO_OUTLINE_STARTED':
          scenario = createScenario(line, tags);
          feature.scenarios.push(scenario);
          tags = [];
          break;
        case 'EXAMPLES_STARTED':
          scenario.examples = createExamples(line);
          break;
        default:
      }
    } else if (line.startsWith('@')) {
      tags = line.split(' ');
      if (!currentPhase) {
        // Feature tags
        feature.tags = tags;
      }
    } else if (line.startsWith('#')) {
      // Gherkin comments start with '#' and are required to take an entire line.
      // We want to skip any comment lines.
    } else if (line.startsWith('|')) {
      const step = scenario.steps[scenario.steps.length - 1];
      const lines = line.split('|').filter((entry) => entry).map((entry) => entry.trim());
      switch (currentPhase) {
        case 'EXAMPLES_STARTED':
          scenario.examples.table.push(lines);
          break;
        default:
          step.table.push(lines);
      }
    } else if (stepStarting(line)) {
      scenario.steps.push(createStep(line));
    } else if (line.length > 0) {
      // Nothing new is starting. Must be part of a description
      switch (currentPhase) {
        case 'FEATURE_STARTED':
          feature.description += feature.description ? `\n${line}` : line;
          break;
        case 'BACKGROUND_STARTED':
          feature.background.description += feature.background.description ? `\n${line}` : line;
          break;
        default:
          scenario.description += scenario.description ? `\n${line}` : line;
      }
    }
  });
  return feature;
};

const getFilteredScenarios = (scenarios) => scenarios.map((scenario) => {
  if (scenario.tags && scenario.tags.includes(tagFilter)) {
    return scenario;
  }
  return undefined;
}).filter((scenario) => scenario);

const populateHtmlIdentifiers = (feature) => {
  feature.featureId = idSequence;
  idSequence += 1;
  feature.featureWrapperId = idSequence;
  idSequence += 1;
  feature.scenarios.forEach((scenario) => {
    scenario.scenarioId = idSequence;
    idSequence += 1;
    scenario.scenarioButtonId = idSequence;
    idSequence += 1;
  });
};

const populateTagStrings = (feature) => {
  feature.tagString = '';
  feature.tags.forEach((tag) => { feature.tagString += `${tag} `; });
  feature.scenarios.forEach((scenario) => {
    scenario.tagString = '';
    scenario.tags.forEach((tag) => { scenario.tagString += `${tag} `; });
  });
};

// eslint-disable-next-line no-unused-vars
const parseFeatureFile = (item, nodePath, fsStats) => {
  let feature = getFeatureFromFile(item.path);

  if (tagFilter) {
    const filteredScenarios = getFilteredScenarios(feature.scenarios);
    if (filteredScenarios.length > 0) {
      feature.scenarios = filteredScenarios;
    } else {
      feature = undefined;
    }
  }
  if (feature) {
    item.feature = feature;
    populateHtmlIdentifiers(feature);
    populateTagStrings(feature);
  }
};

const getFeaturesHtml = (featureFileTree) => {
  let featuresHtml = '';
  featureFileTree.children.forEach((child) => {
    if (child.type === 'file') {
      featuresHtml += featureHbTemplate(child.feature);
    } else if (child.type === 'directory') {
      featuresHtml += getFeaturesHtml(child);
    }
  });
  return featuresHtml;
};

const trimCucumberKeywords = (name, ...i18nkeys) => {
  const keywords = i18nkeys.map((i18nkey) => i18n.t(i18nkey));
  const startingKeywords = keywords.filter((key) => name.startsWith(key));
  const charsToTrim = startingKeywords.length > 0 ? startingKeywords[0].length + 1 : 0;
  return name.slice(charsToTrim).trim();
};

const getFeatureButtons = (featureFileTree) => {
  const featureButtons = [];
  featureFileTree.children.forEach((child) => {
    if (child.type === 'file') {
      const { feature } = child;
      const featureButton = {};
      featureButton.featureId = feature.featureId;
      featureButton.featureWrapperId = feature.featureWrapperId;
      featureButton.title = trimCucumberKeywords(feature.name, 'feature');
      featureButton.scenarioButtons = [];
      feature.scenarios.forEach((scenario) => {
        const scenarioButton = {};
        scenarioButton.id = scenario.scenarioButtonId;
        scenarioButton.scenarioId = scenario.scenarioId;
        scenarioButton.title = trimCucumberKeywords(scenario.name, 'scenario', 'scenario_outline');
        featureButton.scenarioButtons.push(scenarioButton);
      });
      featureButtons.push(featureButton);
    }
  });
  return featureButtons;
};

const getDirectoryButtonHtml = (featureFileTree) => {
  const sidenavData = {};
  sidenavData.title = featureFileTree.name;
  sidenavData.featureButtons = getFeatureButtons(featureFileTree);
  sidenavData.sidenavButtonsHtml = '';

  featureFileTree.children.forEach((child) => {
    if (child.type === 'directory') {
      sidenavData.sidenavButtonsHtml += getDirectoryButtonHtml(child);
    }
  });
  return sidenavButtonsTemplate(sidenavData);
};

const getSidenavButtonsHtml = (featureFileTree) => {
  // Reduce directories at the root of the tree if they only have a single child that is a directory
  let sidenavButtonsHtml = '';
  while (featureFileTree.children.length === 1 && featureFileTree.children[0].type === 'directory') {
    // Only advance if new root has no feature children
    const [newRoot] = featureFileTree.children;
    if (newRoot.children.filter((child) => child.type === 'file').length === 0) {
      featureFileTree = newRoot;
    }
  }

  featureFileTree.children.forEach((child) => {
    sidenavButtonsHtml += getDirectoryButtonHtml(child);
  });
  return sidenavButtonsHtml;
};

const create = (directoryPath) => {
  const featureFileTree = dirTree(directoryPath, { extensions: /\.feature/ }, parseFeatureFile);

  const docData = {};
  docData.cssStyles = cssStyles;
  docData.scripts = scripts;
  docData.logo = logo;
  docData.cog = cog;
  docData.creationdate = moment().format('LL');
  docData.author = author;
  docData.reportName = reportName;
  docData.projectName = projectName;
  docData.featuresHtml = getFeaturesHtml(featureFileTree);
  docData.sidenavButtonsHtml = getSidenavButtonsHtml(featureFileTree);
  return docHbTemplate(docData);
};

class Generator {
  constructor() {
    author = os.userInfo().username;

    const sidenavButtonsTemplatePath = path.resolve(__dirname, TEMPLATESDIR, 'sidenav_buttons_template.html');
    sidenavButtonsTemplate = handlebars.compile(fs.readFileSync(sidenavButtonsTemplatePath, FILE_ENCODING));
    const docTemplatePath = path.resolve(__dirname, TEMPLATESDIR, 'doc_template.html');
    docHbTemplate = handlebars.compile(fs.readFileSync(docTemplatePath, FILE_ENCODING));
    const featureTemplatePath = path.resolve(__dirname, TEMPLATESDIR, 'feature_template.html');
    featureHbTemplate = handlebars.compile(fs.readFileSync(featureTemplatePath, FILE_ENCODING));
    cssStyles = fs.readFileSync(path.resolve(__dirname, TEMPLATESDIR, 'style.css'), FILE_ENCODING);
    scripts = fs.readFileSync(path.resolve(__dirname, TEMPLATESDIR, 'scripts.js'), FILE_ENCODING);
    logo = fs.readFileSync(path.resolve(__dirname, TEMPLATESDIR, 'logo.b64'), FILE_ENCODING);
    cog = fs.readFileSync(path.resolve(__dirname, TEMPLATESDIR, 'cog.b64'), FILE_ENCODING);
  }

  // eslint-disable-next-line class-methods-use-this
  async generate(directoryPath, name = null, tag = null) {
    if (!directoryPath) {
      throw new Error('U done messed up');
    }
    if (name) {
      projectName = name.trim();
    }
    if (tag) {
      tagFilter = tag.trim();
      if (!tagFilter.startsWith('@')) {
        tagFilter = `@${tagFilter}`;
      }
      reportName = tag;
    } else {
      tagFilter = null;
      reportName = DEFAULT_REPORT_NAME;
    }
    i18n.use(i18nBackend);
    await i18n.init({
      lng: LANGUAGE,
      backend: {
        loadPath: `${__dirname}/locales/{{lng}}/{{ns}}.json`,
      },
    });
    return create(directoryPath);
  }
}

module.exports = Generator;
