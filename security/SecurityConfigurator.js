var exec = require('child_process').exec,
  child;

function SecurityConfigurator() {

  var _this = this;
  var securityStrategy;
  var configurations;

  this.initialize = function(configurations, app) {

    _this.configurations = configurations;

    if (!configurations.enable) {
      return;
    }

    if (!configurations.npmModule) {
      throw Error("security is enabled  but security npm module is not defined");
    }

    var npmModule = configurations.npmModule;
    logger.info("Loading security npm module:" + npmModule.name);

    var configModule = configurations.configModule;

    if (!configModule) {
      logger.info("Custom module config is empty or missing. Does your module need no settings?");
    }

    pluginHelper.simpleLoadNpmModuleByName(npmModule, [], function(npmModuleIntance) {
      _this.securityStrategy = npmModuleIntance.getSecurityStrategy(app, configModule);
      if (_this.securityStrategy) {
        logger.info("Security validator is configured now");
      }else{
        logger.error("Security validator is wrong. Review logs");
      }
    });

  }

  this.hasProtectedAccess = function(req, res, next) {
    if (!_this.configurations.enable) {
      logger.debug("Skip Security for:" + req.originalUrl)
      return next();
    }

    _this.securityStrategy.ensureAuthenticated(req, res, next);
  }

}

inheritsFrom(SecurityConfigurator, NodejsInjectableModule);
module.exports = SecurityConfigurator;
