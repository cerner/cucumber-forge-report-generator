# How to Release

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automatically release new versions when commits are merged to the master branch.  The semantic-release process is triggered as part of the [Travis build](https://travis-ci.com/cerner/cucumber-forge-report-generator).

To ensure that releases are triggered properly, the following standards should be applied to commit messages for the master branch:

| Commit message | Release type |
|----------------|--------------|
| `chore: do some maintenance work` | No Release |
| `fix(pencil): stop graphite breaking when too much pressure applied` | Patch Release |
| `feat(pencil): add 'graphiteWidth' option` | ~~Minor~~ Feature Release |
| `perf(pencil): remove graphiteWidth option`<br><br>`BREAKING CHANGE: The graphiteWidth option has been removed.`<br>`The default graphite width of 10mm is always used for performance reasons.` | ~~Major~~ Breaking Release |
