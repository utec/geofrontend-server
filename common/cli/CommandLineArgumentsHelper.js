const path = require('path');

function CommandLineArgumentsHelper() {}

CommandLineArgumentsHelper.configureGlobalParameters = function(launchedArguments, localGeoFrontServerHomePath) {
  const args = require("args-parser")(process.argv)
  var processFolderPath = process.cwd();

  console.log("Geofront Server is starting");
  console.log("arguments:");
  console.log(args);

  console.log("process directory : "+processFolderPath);
  console.log("geofront server path: "+localGeoFrontServerHomePath);

  global.geoFrontServerHomePath = localGeoFrontServerHomePath;

  if (typeof args.config === 'undefined') {
    global.geoFrontServerConfigurationsFilePath = processFolderPath + path.sep + "application.json";
    console.log("-config parameter was not found. Default application.json path will be used:"+geoFrontServerConfigurationsFilePath);
  }else{
    global.geoFrontServerConfigurationsFilePath = getRealPath(args.config, processFolderPath);
  }

  if (typeof args.pages === 'undefined') {
    global.geoFrontServerCommonPagesPath = processFolderPath + path.sep + 'pages/common';
    console.log("-pages parameter was not found. Default common pages path will be used:"+geoFrontServerCommonPagesPath);
  }else{
    global.geoFrontServerCommonPagesPath = getRealPath(args.pages, processFolderPath);
  }

  if (typeof args.bundle === 'undefined') {
    global.geoFrontServerBundlePath = processFolderPath + path.sep + 'build';
    console.log("-bundle parameter was not found. Default bundle path will be used:"+geoFrontServerBundlePath);
  }else{
    global.geoFrontServerBundlePath = getRealPath(args.bundle, processFolderPath);
  }

};

function isLaunchedAsModule(arguments) {
  //if has more than 2 arguments, it was launched as npm module
  return Object.keys(arguments).length > 0
};

function getRealPath(unwnownPath, defaultRootFolder) {
  if(unwnownPath.startsWith(".")){
    return defaultRootFolder + unwnownPath.substring(1, unwnownPath.length);
  }else if(unwnownPath.startsWith(path.sep)){
    return unwnownPath;
  }else{
    throw new Error(unwnownPath+" does not start with dot or slash.");
  }
};

module.exports = CommandLineArgumentsHelper;
