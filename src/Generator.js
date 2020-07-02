const dirTree = require('directory-tree');
const fs = require('fs');
const handlebars = require('handlebars');
const i18n = require('i18next');
const i18nBackend = require('i18next-fs-backend');
const moment = require('moment');
const os = require('os');
const path = require('path');
const SUPPORTED_LANGUAGES = require('./locales/supportedLocales.json');

const FILE_ENCODING = 'utf-8';
const TEMPLATESDIR = 'templates';
const DEFAULT_REPORT_NAME = 'All Scenarios';

let language;
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

const lineStartsWithI18n = (translations, line, i18nkey) => translations(i18nkey,
  { returnObjects: true }).filter((translation) => line.startsWith(translation)).length > 0;

const stepStarting = (translations, line) => lineStartsWithI18n(translations, line, 'given')
    || lineStartsWithI18n(translations, line, 'when') || lineStartsWithI18n(translations, line, 'then')
    || lineStartsWithI18n(translations, line, 'and') || lineStartsWithI18n(translations, line, 'but') || line.trim().startsWith('*');

const createScenario = (name, tags) => ({
  name,
  description: '',
  tags,
  steps: [],
});

const createExamples = (name) => ({
  name,
  table: [],
});

const createStep = (name) => ({
  name,
  table: [],
  docString: '',
});

const getNewPhase = (translations, line) => {
  if (lineStartsWithI18n(translations, line, 'feature')) {
    return 'FEATURE_STARTED';
  }
  if (lineStartsWithI18n(translations, line, 'background')) {
    return 'BACKGROUND_STARTED';
  }
  if (lineStartsWithI18n(translations, line, 'scenario')) {
    return 'SCENARIO_STARTED';
  }
  if (lineStartsWithI18n(translations, line, 'scenario_outline')) {
    return 'SCENARIO_OUTLINE_STARTED';
  }
  if (lineStartsWithI18n(translations, line, 'examples')) {
    return 'EXAMPLES_STARTED';
  }
  if (line === '\'\'\'' || line === '"""') {
    return 'DOC_STRING_STARTED';
  }
  return null;
};

const getFeatureFileLanguage = (featureFilename, fileLines) => {
  if (fileLines.length === 0) {
    return language;
  }
  const givenLang = fileLines[0].match(/^\s*#\s*language:\s*(\w+)\s*$/);
  if (!givenLang || givenLang.length < 2) {
    return language;
  }
  if (!SUPPORTED_LANGUAGES.includes(givenLang[1])) {
    throw new Error(`The language [${givenLang[1]}] configured for the feature file [${featureFilename}] is not supported.`);
  }
  return givenLang[1];
};

const getFeatureFromFile = (featureFilename) => {
  const feature = {
    scenarios: [],
    tags: [],
    description: '',
    name: '',
  };
  let scenario = null;
  let tags = [];

  let currentPhase = null;

  const fileLines = fs
    .readFileSync(featureFilename, FILE_ENCODING)
    .replace('\r\n', '\n')
    .split('\n');

  feature.language = getFeatureFileLanguage(featureFilename, fileLines);
  const translations = i18n.getFixedT(feature.language);

  fileLines.forEach((nextLine) => {
    const line = nextLine.trim();
    const newPhase = getNewPhase(translations, line);
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
      const lines = line
        .split('|')
        .filter((entry) => entry).map((entry) => entry.trim());
      switch (currentPhase) {
        case 'EXAMPLES_STARTED':
          scenario.examples.table.push(lines);
          break;
        default:
          step.table.push(lines);
      }
    } else if (stepStarting(translations, line)) {
      if (scenario) {
        scenario.steps.push(createStep(line));
      }
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
          if (scenario) {
            scenario.description += scenario.description ? `\n${line}` : line;
          }
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

const includeFeature = (feature) => {
  if (!tagFilter || feature.tags.includes(tagFilter)) {
    return true;
  }
  feature.scenarios = getFilteredScenarios(feature.scenarios);
  return feature.scenarios.length > 0;
};

// eslint-disable-next-line no-unused-vars
const parseFeatureFile = (item, nodePath, fsStats) => {
  const feature = getFeatureFromFile(item.path);
  if (includeFeature(feature)) {
    item.feature = feature;
    populateHtmlIdentifiers(feature);
    populateTagStrings(feature);
  }
};

const pruneFeatureFileTree = (featureFileTree) => {
  featureFileTree.children = featureFileTree.children
    .filter((child) => (child.type === 'file' ? child.feature : pruneFeatureFileTree(child)));
  return featureFileTree.children.length > 0;
};

const getFeatureFileTree = (directoryPath) => {
  let featureFileTree = dirTree(directoryPath, {
    extensions: /\.feature/,
    exclude: /node_modules|target/,
  }, parseFeatureFile);
  // Prune the tree so it only contains the feature files and the directories that contain them
  pruneFeatureFileTree(featureFileTree);

  // Reduce directories at the root of the tree if they only have a single child that is a directory
  while (featureFileTree.children.length === 1 && featureFileTree.children[0].type === 'directory') {
    // Only advance if new root has no feature children
    // (top-level elements should only be directories)
    const [newRoot] = featureFileTree.children;
    if (!newRoot.children.filter((child) => child.type === 'file').length) {
      featureFileTree = newRoot;
    } else {
      break;
    }
  }

  return featureFileTree;
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

const trimCucumberKeywords = (translations, name, ...i18nkeys) => {
  const keywords = i18nkeys.flatMap((i18nkey) => translations(i18nkey, { returnObjects: true }));
  const startingKeywords = keywords.filter((key) => name.startsWith(key));
  const charsToTrim = startingKeywords.length > 0 ? startingKeywords[0].length + 1 : 0;
  return name.slice(charsToTrim).trim();
};

const getFeatureButtons = (featureFileTree) => {
  const featureButtons = [];
  featureFileTree.children
    .filter((child) => child.type === 'file')
    .forEach((child) => {
      const { feature } = child;
      const translations = i18n.getFixedT(feature.language);
      const featureButton = {
        featureId: feature.featureId,
        featureWrapperId: feature.featureWrapperId,
        title: trimCucumberKeywords(translations, feature.name, 'feature'),
        scenarioButtons: [],
      };
      feature.scenarios.forEach((scenario) => {
        featureButton.scenarioButtons.push({
          id: scenario.scenarioButtonId,
          scenarioId: scenario.scenarioId,
          title: trimCucumberKeywords(translations, scenario.name, 'scenario', 'scenario_outline'),
        });
      });
      featureButtons.push(featureButton);
    });
  return featureButtons;
};

const getDirectoryButtonHtml = (featureFileTree) => {
  const sidenavData = {
    title: featureFileTree.name,
    featureButtons: getFeatureButtons(featureFileTree),
    sidenavButtonsHtml: '',
  };

  featureFileTree.children
    .filter((child) => child.type === 'directory')
    .forEach((child) => { sidenavData.sidenavButtonsHtml += getDirectoryButtonHtml(child); });

  return sidenavButtonsTemplate(sidenavData);
};

const getSidenavButtonsHtml = (featureFileTree) => {
  let buttonsHtml = '';
  // If the top level directory contains feature files, run on the top-level and not the children.
  if (featureFileTree.children.filter((child) => child.type === 'file').length > 0) {
    buttonsHtml = getDirectoryButtonHtml(featureFileTree);
  } else {
    featureFileTree.children.forEach((child) => { buttonsHtml += getDirectoryButtonHtml(child); });
  }
  return buttonsHtml;
};

const create = (directoryPath) => {
  const featureFileTree = getFeatureFileTree(directoryPath);
  if (featureFileTree.children.length === 0) {
    throw new Error('No feature files were found in the given directory.');
  }
  return docHbTemplate({
    cssStyles,
    scripts,
    logo,
    cog,
    creationdate: moment().format('LL'),
    author,
    reportName,
    projectName,
    featuresHtml: getFeaturesHtml(featureFileTree),
    sidenavButtonsHtml: getSidenavButtonsHtml(featureFileTree),
  });
};

class Generator {
  constructor() {
    author = os.userInfo().username;

    const sidenavButtonsTemplatePath = path
      .resolve(__dirname, TEMPLATESDIR, 'sidenav_buttons_template.html');
    sidenavButtonsTemplate = handlebars
      .compile(fs.readFileSync(sidenavButtonsTemplatePath, FILE_ENCODING));
    const docTemplatePath = path.resolve(__dirname, TEMPLATESDIR, 'doc_template.html');
    docHbTemplate = handlebars.compile(fs.readFileSync(docTemplatePath, FILE_ENCODING));
    const featureTemplatePath = path.resolve(__dirname, TEMPLATESDIR, 'feature_template.html');
    featureHbTemplate = handlebars.compile(fs.readFileSync(featureTemplatePath, FILE_ENCODING));
    cssStyles = fs.readFileSync(path.resolve(__dirname, TEMPLATESDIR, 'style.css'), FILE_ENCODING);
    scripts = fs.readFileSync(path.resolve(__dirname, TEMPLATESDIR, 'scripts.js'), FILE_ENCODING);
    logo = fs.readFileSync(path.resolve(__dirname, TEMPLATESDIR, 'logo.b64'), FILE_ENCODING);
    cog = fs.readFileSync(path.resolve(__dirname, TEMPLATESDIR, 'cog.b64'), FILE_ENCODING);
    i18n.use(i18nBackend);
    i18n.init({
      preload: SUPPORTED_LANGUAGES,
      initImmediate: false,
      backend: {
        loadPath: `${__dirname}/locales/{{lng}}/{{ns}}.json`,
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  generate(directoryPath, name = null, tag = null, dialect = 'en') {
    if (!directoryPath) {
      throw new Error('A feature directory path must be provided.');
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
    if (!SUPPORTED_LANGUAGES.includes(dialect)) {
      throw new Error(`The provided dialect [${dialect}] is not supported.`);
    }
    language = dialect;
    return create(directoryPath);
  }
}

module.exports = Generator;
