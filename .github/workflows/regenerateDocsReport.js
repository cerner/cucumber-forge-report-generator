#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Generator = require('../../src/Generator');

const FILE_ENCODING = 'utf-8';

const report = new Generator().generate(path.resolve(__dirname, '../../'), 'cucumber-forge-report-generator')
fs.writeFileSync(path.resolve(__dirname, '../../docs/index.html'), report, FILE_ENCODING);
