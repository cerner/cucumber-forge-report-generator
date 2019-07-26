# How to Release

Releasing the project requires these steps:

0. Upgrade dependency versions as necessary. (See: `npm audit`)
1. Run `npm version *major|minor|patch*` (this project uses [semantic versioning](http://semver.org/))
2. Push new commit to master and push the newly created tag (this will trigger a Travis build)
3. Wait for the Travis build to complete
4. [Create a new release on GitHub](https://help.github.com/articles/creating-releases/) for the tag and add changelog information for the changes included in the release
