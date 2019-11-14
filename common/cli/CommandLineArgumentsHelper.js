const path = require('path');

function CommandLineArgumentsHelper() {
}

CommandLineArgumentsHelper.configureGlobalParameters = function(launchedArguments, localGeoFrontServerHomePath) {

  if (isLaunchedAsModule(launchedArguments)) {
  	console.log("Geofront Server is launching as npm module");
    var parameters = getGeoFrontServerParameters(launchedArguments);

    global.geoFrontServerHomePath = localGeoFrontServerHomePath;
  	global.geoFrontServerConfigurationsFilePath = parameters.geoFrontServerConfigurationsFilePath;
  	global.geoFrontServerBundlePath = parameters.geoFrontServerBundlePath;

  	if(parameters.geoFrontServerCommonPagesPath){
  	  global.geoFrontServerCommonPagesPath = parameters.geoFrontServerCommonPagesPath;
  	}else{
  	  global.geoFrontServerCommonPagesPath = './pages/common';
  	}

  } else {
  	console.log("Geofront Server is launching as server");
    global.geoFrontServerHomePath = process.cwd();
    global.geoFrontServerConfigurationsFilePath = process.cwd() + path.sep + "application.json";
    global.geoFrontServerBundlePath = process.cwd() + path.sep + 'build';
    global.geoFrontServerCommonPagesPath = process.cwd() + path.sep + 'pages/common';
  }

};

function isLaunchedAsModule (launchedArguments) {
  //if has more than 2 arguments, it was launched as npm module
  return (launchedArguments.length > 2);
};

function getGeoFrontServerParameters(launchedArguments) {

  if(launchedArguments.length < 4){
    throw new Error("02 parameters at least are required. Current parameters count: "+launchedArguments.length + " and values: "+launchedArguments.slice(2));
  }

  //TODO:validate
  return {
    "geoFrontServerConfigurationsFilePath":launchedArguments[2],
    "geoFrontServerBundlePath":launchedArguments[3],
    "geoFrontServerCommonPagesPath":(launchedArguments.length >3 ? launchedArguments[4]:null)
  }

};

module.exports = CommandLineArgumentsHelper;
