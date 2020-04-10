# How to Release

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automatically release new versions when commits are merged to the master branch.  The semantic-release process is triggered as part of the [Travis build](https://travis-ci.com/cerner/cucumber-forge-report-generator).

To ensure that releases are triggered properly, the [AngularJS commit message standards](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#) should be applied to commit messages for the master branch.

## Format of the commit message

```.txt
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

## Message header

The message header is a single line that contains succinct description of the change containing a type, an optional scope and a subject.

### `<type>`

This describes the kind of change that this commit is providing.

- `feat` (feature)
- `fix` (bug fix)
- `docs` (documentation)
- `style` (formatting, missing semi colons, …)
- `refactor`
- `test` (when adding missing tests)
- `chore` (maintain)

### `<scope>`

Scope can be anything specifying place of the commit change. For example $location, $browser, $compile, $rootScope, ngHref, ngClick, ngView, etc...

You can use * if there isn't a more fitting scope.

### `<subject>`

This is a very short description of the change.

- Use imperative, present tense: “change” not “changed” nor “changes”
- Don't capitalize first letter
- No dot (.) at the end

## Message body

- Just as in `<subject>` use imperative, present tense: “change” not “changed” nor “changes”
- Includes motivation for the change and contrasts with previous behavior

## Message footer

### Breaking changes

All breaking changes have to be mentioned as a breaking change block in the footer, which should start with the word `BREAKING CHANGE: ` with a space or two newlines. The rest of the commit message is then the description of the change, justification and migration notes.

### Referencing issues

Closed bugs should be listed on a separate line in the footer prefixed with `Closes` keyword like this:

`Closes #234`

Or in case of multiple issues:

`Closes #123, #245, #992`

## Examples

```.txt
--------------------------------------------------------------------------------
feat($browser): onUrlChange event (popstate/hashchange/polling)

Added new event to $browser:
- forward popstate event if available
- forward hashchange event if popstate not available
- do polling when neither popstate nor hashchange available

Breaks $browser.onHashChange, which was removed (use onUrlChange instead)
--------------------------------------------------------------------------------
fix($compile): couple of unit tests for IE9

Older IEs serialize html uppercased, but IE9 does not...
Would be better to expect case insensitive, unfortunately jasmine does
not allow to user regexps for throw expectations.

Closes #392
Breaks foo.bar api, foo.baz should be used instead
--------------------------------------------------------------------------------
feat(directive): ng:disabled, ng:checked, ng:multiple, ng:readonly, ng:selected

New directives for proper binding these attributes in older browsers (IE).
Added coresponding description, live examples and e2e tests.

Closes #351
--------------------------------------------------------------------------------
style($location): add couple of missing semi colons
--------------------------------------------------------------------------------
docs(guide): updated fixed docs from Google Docs

Couple of typos fixed:
- indentation
- batchLogbatchLog -> batchLog
- start periodic checking
- missing brace
--------------------------------------------------------------------------------
feat($compile): simplify isolate scope bindings

Changed the isolate scope binding options to:
  - @attr - attribute binding (including interpolation)
  - =model - by-directional model binding
  - &expr - expression execution binding

This change simplifies the terminology as well as
number of choices available to the developer. It
also supports local name aliasing from the parent.

BREAKING CHANGE: isolate scope bindings definition has changed and
the inject option for the directive controller injection was removed.

To migrate the code follow the example below:

Before:

scope: {
  myAttr: 'attribute',
  myBind: 'bind',
  myExpression: 'expression',
  myEval: 'evaluate',
  myAccessor: 'accessor'
}

After:

scope: {
  myAttr: '@',
  myBind: '@',
  myExpression: '&',
  // myEval - usually not useful, but in cases where the expression is assignable, you can use '='
  myAccessor: '=' // in directive's template change myAccessor() to myAccessor
}

The removed `inject` wasn't generally useful for directives so there should be no code using it.
--------------------------------------------------------------------------------
```
