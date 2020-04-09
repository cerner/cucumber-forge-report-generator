#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Generator = require('../src/Generator');

const FILE_ENCODING = 'utf-8';

new Generator().generate(path.resolve(__dirname, '../'), 'cucumber-forge-report-generator').then((result) => {
  fs.writeFileSync(path.resolve(__dirname, '../docs/index.html'), result, FILE_ENCODING);
});
