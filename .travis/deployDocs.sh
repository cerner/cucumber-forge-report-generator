#!/bin/sh
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git config --global push.default current
git checkout ${TRAVIS_BRANCH}

node ./.travis/regenerateDocsReport.js

git push https://${GH_TOKEN}@github.com/cerner/cucumber-forge-report-generator.git