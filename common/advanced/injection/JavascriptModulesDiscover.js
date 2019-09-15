const fs = require('fs');
const pathUtil = require('path');

var NodejsInjectableModule = function() {
};

global.NodejsInjectableModule = NodejsInjectableModule;

global.inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
};

function JavascriptModulesDiscover() {

}

JavascriptModulesDiscover.scan = function(path, excludes) {
  logger.info("Automatic scanning of nodejs functions...");

  var files = []
  getJsFiles(path, files)

  logger.debug(files);

  for (var key in files) {
    var file = files[key];
    var fileName = pathUtil.basename(file);

    var ext = pathUtil.extname(file);
    if (file.includes("JavascriptModulesDiscover.js") || file.includes("NodejsInjectableModule.js")) {
      continue;
    }
    if (excludes.includes(fileName)) {
      continue;
    }


    var functionRequire = require(file);
    logger.debug("Detected file:"+file)
    var functionInstance = new functionRequire();
    if (functionInstance.constructor.name !== "NodejsInjectableModule") {
      continue;
    }

    logger.info("New injectable module detected:" + file);
    logger.info("Instantiation is starting...");
    logger.debug("functionInstance.constructor.name:"+functionInstance.constructor.name);


    var functionName = pathUtil.basename(file).replace(ext, "");
    var functionInstanceName = functionName.charAt(0).toLowerCase() + functionName.slice(1);
    var functionInstanceName = functionName.charAt(0).toLowerCase() + functionName.slice(1);
    global[functionInstanceName] = functionInstance;
    logger.info("Function [" + functionInstanceName + "] was registered in global bootstrap context.");
  }
};

//original: https://stackoverflow.com/a/36730872/3957754
var getJsFiles = function(path, files, excludes) {
  fs.readdirSync(path).forEach(function(file) {
    var subpath = path + '/' + file;
    if (fs.lstatSync(subpath).isDirectory()) {
      if (subpath.includes("node_modules") || subpath.includes(".git")|| subpath.includes("build")) {
        return;
      }
      getJsFiles(subpath, files);
    } else {
      var ext = pathUtil.extname(file);
      if (ext !== ".js") {
        return;
      }
      files.push(path + '/' + file);
    }
  });
}


module.exports = JavascriptModulesDiscover;
