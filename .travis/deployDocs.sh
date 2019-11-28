#!/bin/sh
echo Preparing to deploy documentation!
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git config --global push.default current
# git stash
git checkout ${TRAVIS_BRANCH}
# git stash pop

node ./.travis/regenerateDocsReport.js

git push https://${GH_TOKEN}@github.com/cerner/cucumber-forge-report-generator.git