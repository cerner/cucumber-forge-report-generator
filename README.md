<p align="center">
  <img src="logo.png">
</p>

<h1 align="center">
  Cucumber Forge Report Generator
</h1>

[![Cerner OSS](https://badgen.net/badge/Cerner/OSS/blue)](http://engineering.cerner.com/2014/01/cerner-and-open-source/)
[![License](https://badgen.net/badge/license/Apache-2.0/blue)](https://github.com/cerner/cucumber-forge-report-generator/blob/master/LICENSE)
[![Build Status](https://travis-ci.com/cerner/cucumber-forge-report-generator.svg?branch=master)](https://travis-ci.com/cerner/cucumber-forge-report-generator)

# _About_
_Note: this repository contains the library for generating Cucumber reports. [Cucumber Forge Desktop](https://github.com/cerner/cucumber-forge-desktop) is a user-friendly desktop application for creating reports with cucumber-forge-report-generator._

The cucumber-forge-report-generator can be used to create clean HTML reports without having to build the project or run the tests. Of course, no pass/fail information for the scenarios is included in the report since the tests are not executed.

Many other solutions exist for creating reports based on the output of Cucumber test runs. The goal of *cucumber-forge-report-generator* is to create reports directly from the feature files without any of the environment/runtime overhead required to build projects and run the Cucumber tests.

# _Usage_

Sample - Generates a report from two feature files with the scenarios filtered by a tag:
```js
const Generator = require('cucumber-forge-report-generator');
const generator = new Generator();
const htmlReportString = generator.generate([filePathString1, filePathString2], 'Project Name', 'TagFilter');
```
Detailed usage documentation can be found [here](https://engineering.cerner.com/cucumber-forge-report-generator/).

# _Availability_

Artifacts can be downloaded from the [latest release](https://github.com/cerner/cucumber-forge-report-generator/releases).

This library can be added as an NPM dependency via `npm install cucumber-forge-report-generator`

This project is built on [Travis](https://travis-ci.com/cerner/cucumber-forge-report-generator/).

# _Building_

Development Environment:
* [NPM](https://www.npmjs.com/) - ^6.4.1
* [Node.Js](https://nodejs.org) - ^10.14.1

To build the project, simply run `npm install` from the project directory.

Linting is available and can be run via `npm lint`.

To execute the automated tests, simply run `npm test` from the project directory.

# _Conventions_

The project extends the `eslint-config-airbnb` [ESLint](https://eslint.org/) configuration. This provides formatting standards for breaks, line length, declarations, etc.

Tests for the project are written with [cucumber-js](https://github.com/cucumber/cucumber-js)

# _Communication_

If you have any issues or questions, please log a [Github issue](https://github.com/cerner/cucumber-forge-report-generator/issues) for this repository. See our [contribution guidelines](CONTRIBUTING.md) for tips on how to submit a helpful issue.

# _Contributing_

See [CONTRIBUTING.md](CONTRIBUTING.md)

# _LICENSE_

Copyright 2019 Cerner Innovation, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

&nbsp;&nbsp;&nbsp;&nbsp;http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
