var fs = require('fs');
var ncp = require('ncp');
var pug = require('pug');
var path = require('path');
var rimraf = require('rimraf');
var replace = require('replace');

var publicPath = path.join(process.cwd(), 'public');
var distPath = path.join(process.cwd(), 'dist');
var indexPath = path.join(process.cwd(), 'views', 'index.pug');
var destIndexPath = path.join(distPath, 'index.html');
var destIndexRTLPath = path.join(distPath, 'index-rtl.html');
var jsPath = path.join(distPath, 'js');
var cssPath = path.join(distPath, 'css');
var jsAppPath = path.join(jsPath, 'app.js');

module.exports = function(callback) {
  rimraf(distPath, function() {
    fs.mkdirSync(distPath);

    ncp(publicPath, distPath, function(err) {
      if (err) {
        return console.error(err);
      }

      var fn = pug.compileFile(indexPath, {
        pretty: true
      });

      var html = fn({
        app_scripts: "\n    <script src='js/plugins.js'></script>\n    <script src='js/app.js'></script>",
        app_stylesheets: "\n    <link rel='stylesheet' href='css/main.css' />"
      });

      var htmlRTL = fn({
        app_scripts: "\n    <script src='js/plugins.js'></script>\n    <script src='js/app.js'></script>",
        app_stylesheets: "\n    <link rel='stylesheet' href='css/main-rtl.css' />"
      });

      fs.writeFileSync(destIndexPath, html + '\n');
      fs.writeFileSync(destIndexRTLPath, htmlRTL + '\n');



      console.log('Replacing!');
      replace({
        regex: '"/locales/"',
        replacement: '"locales/"',
        paths: [jsPath],
        recursive: true,
        silent: false,
      });
      replace({
        regex: '/\./fonts',
        replacement: '../fonts',
        paths: [cssPath],
        recursive: true,
        silent: false,
      });
      replace({
        regex: '"/imgs/',
        replacement: '"../imgs/',
        paths: [cssPath],
        recursive: true,
        silent: false,
      });
      replace({
        regex: '/imgs/',
        replacement: 'imgs/',
        paths: [jsPath],
        recursive: true,
        silent: false,
      });

      console.log('Done!');

      if (callback) callback();
    })
  });
};
