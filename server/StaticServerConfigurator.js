"use strict";

var path = require('path');

function StaticServerConfigurator() {

  this.start = function(express, app) {

    logger.info("Security:" + (properties.server.security.enable));

    if (properties.server.security.enable === "undefined") {
      throw Error("security enable property is not configured. Security autoconfiguration is not possible .");
    }

    securityConfigurator.initialize(properties.server.security, app);

    var hasProtectedAccess = function(req, res, next) {

      if(properties.server.enableWelcomePage === true && req.session && !req.session.alreadyConnected){
        req.session.alreadyConnected = true;
        sendFile(res, geoFrontServerCommonPagesPath, '/welcome.html');
        return;
      }

      try {
        securityConfigurator.hasProtectedAccess(req, res, next);
      } catch (error) {
        logger.error("requested resource:" + req.originalUrl + " | " + error.code + ": " + error.message);
        if (error.code == "EMAIL_NOT_ALLOWED") {
          sendFile(res, geoFrontServerCommonPagesPath, '/userNotAllowedError.html');
        } else {
          sendFile(res, geoFrontServerCommonPagesPath, '/internalError.html');
        }
      }
    };

    // data from server  to frontend
    // here call to internal systems or whatever to get data
    app.get('/error', function(req, res) {
      sendFile(res, geoFrontServerCommonPagesPath, '/internalError.html');
    });


    if (properties.server.logout && properties.server.logout.enabled && properties.server.logout.enabled === true) {
      logger.info("logout is enabled");
      if (!properties.server.logout.endpoint) {
        logger.info("logout endpoint value is missing");
      }else{
        logger.info("logout endpoint is valid");
        app.get(properties.server.logout.endpoint, function(req, res) {
          logger.info("logout");
          req.session.destroy();
          sendFile(res, geoFrontServerCommonPagesPath, '/welcome.html');
        });
      }
    }else{
      logger.info("logout is not configured");
    }


    // data from server  to frontend
    // here call to internal systems or whatever to get data
    app.get('/settings.json', hasProtectedAccess, function(req, res) {

      if (req.session.connectedUserInformation) {
        var settings = {};
        settings.session = req.session.connectedUserInformation;
        settings.settings = properties.frontend;
        settingsEndpoint.createJsonResponse(settings, req, res);
      } else {
        var settings = {};
        settings.settings = properties.frontend;
        settingsEndpoint.createJsonResponse(settings, req, res);
      }
    });

    /* serve rest of web assets*/
    app.use('/', hasProtectedAccess, express.static(geoFrontServerBundlePath));

    app.get("*", hasProtectedAccess, function(req, res) {
      res.sendFile('/index.html', { root: geoFrontServerBundlePath })
    });

  }

  function sendFile(res, commmonPagesPath, commonPage){
    if(commmonPagesPath.startsWith(".")){
      res.sendFile(commmonPagesPath + '/internalError.html',{ root: geoFrontServerHomePath })
    }else{
      res.sendFile(commmonPagesPath + commonPage)
    }
  }

}

inheritsFrom(StaticServerConfigurator, NodejsInjectableModule);
module.exports = StaticServerConfigurator;
