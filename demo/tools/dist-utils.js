var fs = require('fs');
var ncp = require('ncp');
var pug = require('pug');
var path = require('path');
var rimraf = require('rimraf');
var replace = require('replace');
var base64Img = require('base64-img');

var publicPath = path.join(process.cwd(), 'public');
var distPath = path.join(process.cwd(), 'dist');
var indexPath = path.join(process.cwd(), 'views', 'index.pug');
var destIndexPath = path.join(distPath, 'index.html');
var jsPath = path.join(distPath, 'js');
var cssPath = path.join(distPath, 'css');
var splashImgPath = path.join(distPath, 'imgs/common/splash-screen.jpg');

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

      fs.writeFileSync(destIndexPath, html + '\n');



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

      fs.readFile(path.join(distPath, 'js/pace.js'), 'utf8', function (err,data) {
        replace({
          regex: '<script type="text/javascript" src="js/pace.js"></script>',
          replacement: '<script type="text/javascript">'+data+'</script>',
          paths: [destIndexPath],
          recursive: true,
          silent: false,
        });
      });

      fs.readFile(path.join(distPath, 'css/pace.css'), 'utf8', function (err,data) {
        replace({
          regex: '<link rel="stylesheet" href="css/pace.css">',
          replacement: '<style>'+data+'</style>',
          paths: [destIndexPath],
          recursive: true,
          silent: false,
        });
      });

      base64Img.base64(splashImgPath, function(err, data) {
        replace({
          regex: '../imgs/common/splash-screen.jpg',
          replacement: data,
          paths: [destIndexPath],
          recursive: true,
          silent: false,
        });
      });

      console.log('Done!');


      if (callback) callback();
    })
  });
};
