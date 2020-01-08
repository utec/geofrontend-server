var exec = require('child_process').exec,
  child;

function PluginHelper() {

  var _this = this;

  /*
   Dynamic load of npm modules which have a constructor
  */
  this.dynamicLoadInstantiableNpmModuleByName = function(npmModuleInfo, npmModuleArguments, callback) {

    try {
      const pathToModule = require.resolve(npmModuleInfo.name)
      logger.info('module location:' + pathToModule);
      var npmModule = require(npmModuleInfo.name);

      var npmModuleIntance;

      if (npmModuleArguments && npmModuleArguments.length > 0) {
        npmModuleIntance = new npmModule(npmModuleArguments);
      }else{
        npmModuleIntance = new npmModule();
      }

      logger.info(npmModuleInfo.name + " module is already loaded.");
      return callback(npmModuleIntance);
    } catch (err) {
      if (err instanceof Error && err.code === "MODULE_NOT_FOUND") {
        logger.info(npmModuleInfo.name + " does not exist. I will try to download it ...");
        var npmInstallSentence = 'npm install ' + npmModuleInfo.downloadableName;
        child = exec(npmInstallSentence,
          function(installError, stdout, stderr) {
            logger.info('stdout: ' + stdout);
            if (installError !== null) {
              logger.error('stderr: ' + stderr);
              logger.error('npm install error: ' + installError);
              throw new Error("A rare error was obtained when " + npmModule + " was downloaded." + installError);
            }
            var requireModule = require(npmModuleInfo.name);
            var npmModuleIntance;

            if (npmModuleArguments && npmModuleArguments.length > 0) {
              npmModuleIntance = new requireModule(npmModuleArguments);
            }else{
              npmModuleIntance = new requireModule();
            }

            return callback(npmModuleIntance);
          });

      } else {
        logger.info(err);
        throw new Error("A rare error was obtained when " + npmModule + " was loaded: " + err);
      }
    }
  }

  /*
   Load npm modules which have a constructor
  */
  this.simpleLoadNpmModuleByName = function(npmModuleInfo, npmModuleArguments, callback) {

    try {

      var moduleRequireLocation;
      if(npmModuleInfo.name === "basic-security-client"){
        logger.info("default basic-security-client is enabled");
        moduleRequireLocation = "../../"+npmModuleInfo.name
        logger.info("module location:"+moduleRequireLocation);
      }else{
        moduleRequireLocation = npmModuleInfo.name
        const pathToModule = require.resolve(moduleRequireLocation)
        logger.info('module location:' + pathToModule);
      }

      var npmModule = require(moduleRequireLocation);

      var npmModuleIntance;

      if (npmModuleArguments && npmModuleArguments.length > 0) {
        npmModuleIntance = new npmModule(npmModuleArguments);
      }else{
        npmModuleIntance = new npmModule();
      }

      logger.info(npmModuleInfo.name + " module is ready to use.");
      return callback(npmModuleIntance);
    } catch (err) {
      if (err instanceof Error && err.code === "MODULE_NOT_FOUND") {
        throw new Error(npmModuleInfo.name + " does not exist. Have you added it to your package.json?");
      } else {
        logger.info(err);
        throw new Error("A rare error was obtained when " + npmModule + " was loaded: " + err);
      }
    }
  }

}

inheritsFrom(PluginHelper, NodejsInjectableModule);
module.exports = PluginHelper;
