#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Generator = require('../../src/Generator');

const FILE_ENCODING = 'utf-8';

const featuresDir = path.resolve(__dirname, '../../');
const report = new Generator().generate(featuresDir, 'cucumber-forge-report-generator')

// Create /docs if it doesn't exist
const outputDir = path.resolve(__dirname, '../../docs');
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}
const filePath = path.resolve(outputDir, 'index.html');
fs.writeFileSync(filePath, report, FILE_ENCODING);
