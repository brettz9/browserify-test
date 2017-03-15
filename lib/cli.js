#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _subarg = require('subarg');

var _subarg2 = _interopRequireDefault(_subarg);

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// cli

_commander2.default.version(_package2.default.version).usage('[options] [./test/*.js ...]').option('-w, --watch', 'run watch server on http://localhost:7357').option('-t, --transform <t1,t2,..>', 'add browserify transforms').option('-p, --plugins <p1,p2,..>', 'add browserify plugins').option('-b, --browserifyOptions <jsonStringifiedObj>', 'add browserifyOptions', JSON.parse).option('--testem, --testemOptions <jsonStringifiedObj>', 'add testemOptions', JSON.parse).parse(process.argv);

// prepare files

var argv = (0, _subarg2.default)(process.argv.slice(2), {
  alias: { t: 'transform', transforms: 'transform', p: 'plugins', w: 'watch', testem: 'testemOptions' },
  boolean: ['watch']
});
var files = [];
if (!argv._.length) argv._ = ['./test/*.js'];
argv._.forEach(function (p) {
  return files.push.apply(files, _toConsumableArray(_glob2.default.sync(p)));
});

// parse transforms

var transform = [];
if (argv.transform) {
  if (!Array.isArray(argv.transform)) argv.transform = [argv.transform];
  argv.transform.forEach(function (tr) {
    if (typeof tr === 'string') {
      transform.push(tr);
    } else if (Array.isArray(tr._)) {
      transform.push([tr._[0], (0, _lodash2.default)(tr, '_')]);
    } else {
      throw new Error('invalid --transform value: ' + JSON.stringify(tr));
    }
  });
}

var plugins = [];
if (argv.plugins) {
  if (!Array.isArray(argv.plugins)) argv.plugins = [argv.plugins];
  argv.plugins.forEach(function (tr) {
    if (typeof tr === 'string') {
      plugins.push(tr);
    } else if (Array.isArray(tr._)) {
      plugins.push([tr._[0], (0, _lodash2.default)(tr, '_')]);
    } else {
      throw new Error('invalid --plugins value: ' + JSON.stringify(tr));
    }
  });
}

var browserifyOptions = _commander2.default.browserifyOptions || {};
var testemOptions = _commander2.default.testemOptions || {};
// run testem

(0, _2.default)({
  files: files, transform: transform, plugins: plugins, browserifyOptions: browserifyOptions, testemOptions: testemOptions, watch: _commander2.default.watch || false
});