'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var files = _ref.files,
      entries = _ref.entries,
      transforms = _ref.transforms,
      plugins = _ref.plugins,
      watch = _ref.watch,
      transform = _ref.transform,
      browserifyOptions = _ref.browserifyOptions,
      testemOptions = _ref.testemOptions,
      finalizer = _ref.finalizer;

  if (!files && entries) files = entries;
  if (!files || !files.length) throw new Error('specify files');
  if (!transform && transforms) transform = transforms;

  // setup testem & browserify

  var testem = new _testem2.default();
  var config = Object.assign({
    framework: 'mocha',
    launch_in_ci: ['phantomjs'],
    launch_in_dev: ['phantomjs']
  }, testemOptions);

  var b = void 0;
  if (watch) {
    testem.startDev(config, finalizer);
    b = (0, _watchify2.default)((0, _browserify2.default)(files, Object.assign(_watchify2.default.args, browserifyOptions)));
    b.on('update', function () {
      return testem.app.runTests();
    }); // reload
  } else {
    testem.startCI(config, finalizer);
    b = (0, _browserify2.default)(files, browserifyOptions);
  }

  b.plugin(_errorify2.default);
  if (transform) {
    transform.forEach(function (tr) {
      if (typeof tr === 'string' || typeof tr === 'function') {
        b.transform(tr);
      } else {
        b.transform(tr[0], tr[1]);
      }
    });
  }
  if (plugins) {
    plugins.forEach(function (pl) {
      if (typeof pl === 'string' || typeof pl === 'function') {
        b.plugin(pl);
      } else {
        b.plugin(pl[0], pl[1]);
      }
    });
  }

  // monkey-patch testem to inject compiled bundle to root url

  _server2.default.prototype.serveHomePage = function (req, res) {
    b.bundle().on('error', function (err) {
      res.status(500).send(err.stack);
    }).pipe((0, _concatStream2.default)(function (buf) {
      res.status(200).send('\n        <!doctype html>\n        <html>\n        <head>\n          <title>Tests</title>\n          <style>' + mochaCss + '</style>\n          <script>' + mochaJs + '</script>\n          <script src="/testem.js"></script>\n          <script>mocha.setup(\'bdd\')</script>\n        </head>\n        <body>\n          <div id="mocha"></div>\n          <script>' + buf.toString() + '</script>\n          <script>mocha.run()</script>\n        </body>\n        </html>\n      ');
    }));
  };

  return b;
};

var _browserify = require('browserify');

var _browserify2 = _interopRequireDefault(_browserify);

var _watchify = require('watchify');

var _watchify2 = _interopRequireDefault(_watchify);

var _errorify = require('errorify');

var _errorify2 = _interopRequireDefault(_errorify);

var _testem = require('testem');

var _testem2 = _interopRequireDefault(_testem);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _server = require('testem/lib/server');

var _server2 = _interopRequireDefault(_server);

var _fs = require('fs');

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Since 1.x testem does not bundle mocha files, because of this
 * inline mocha's js/css files to support offline development.
 */

var mochaCss = (0, _fs.readFileSync)((0, _path.join)(__dirname, '../public/mocha234.min.css'), 'utf8');
var mochaJs = (0, _fs.readFileSync)((0, _path.join)(__dirname, '../public/mocha234.min.js'), 'utf8');

/**
 * Run testem server with `opts`.
 *
 * @param {Object} opts
 */