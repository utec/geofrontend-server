"use strict";
const PublicLoginRestClient = require('../login/PublicLoginRestClient.js');
const PublicSolicitudRestClient = require('../login/PublicSolicitudRestClient.js');
var httpContext = require('express-http-context');
var path = require('path');
const uuid = require('uuid');
const fetch = require("isomorphic-fetch");

function StaticServerConfigurator() {

  this.start = function(express, app) {

    var publicLoginRestClient = new PublicLoginRestClient(properties.server.security.configModule.publicLoginBaseUrl);
    var publicSolictudRestClient = new PublicSolicitudRestClient(properties.server.security.configModule.publicSolicitudBaseUrl);
    logger.info("Security:" + (properties.server.security.enable));

    if (properties.server.security.enable === "undefined") {
      throw Error("security enable property is not configured. Security autoconfiguration is not possible .");
    }

    securityConfigurator.initialize(properties.server.security, app);

    var hasProtectedAccess = function(req, res, next) {

      logger.debug("requested resource:" + req.originalUrl);

      // set referer on req session
      if(properties.server.allowedDomains !== undefined){
        var referer = req.get('Referrer') || req.get('Referer')
        logger.debug("referer: ", referer)
        if(isAllowedDomain(referer, properties.server.allowedDomains)) {
          req.session.allowed = true
        }
      }

      // set originalUrl if startsWith "dashboard?" (query param)
      if(req.originalUrl.startsWith("/dashboard?")) {
        req.session.originalUrl = req.originalUrl;
      }

      // comes from
      // - /
      // - /settings.json
      // - /signin
      // - /whatever/../../

      //just for settigns.json
      if(req.path.endsWith("/settings.json")){
        //not a session
        if(!req.session.connectedUserInformation){
          var settings = {};
          settings.session = {};
          settings.session.expiredSession = true;
          responseUtil.createJsonResponse(settings, req, res);
          return;
        }
        // comes from settings and has a valid session, go to hasProtectedAccess validation
      }else{
        //any other request
        //has almost one access and sign button was pressed
        logger.debug("req.session.hasAlreadyEntered:"+req.session.hasAlreadyEntered)
        logger.debug("req.session.signinStarted:"+req.session.signinStarted)
        if(typeof req.session.hasAlreadyEntered === 'undefined' || typeof req.session.signinStarted === 'undefined'){
          if(properties.server.enableWelcomePage === true){
            req.session.hasAlreadyEntered = true;
            res.redirect("/access");
            return;
          }
        }
      }

      logger.debug("validating protected access:"+ req.originalUrl)
      try {
        securityConfigurator.hasProtectedAccess(req, res, next);
      } catch (error) {
        logger.error("requested resource:" + req.originalUrl + " | " + error.code + ": " + error.message);
        res.redirect("/error");
      }
    };

    // data from server  to frontend
    // here call to internal systems or whatever to get data
    app.get('/error', function(req, res) {
      res.render("error.ejs", {
          request_id: sessions[req.sessionID]
      });
    });


    if (properties.server.logout && properties.server.logout.length>0) {
      logger.info("logout is enabled:"+properties.server.logout);
      app.get(properties.server.logout, function(req, res) {
        logger.info("logout");
        req.session.destroy();
        res.redirect("/");
      });
    }


    // data from server  to frontend
    // here call to internal systems or whatever to get data
    app.get('/settings.json', hasProtectedAccess, function(req, res) {

      if (req.session.connectedUserInformation) {
        var settings = {};
        settings.session = {};
        settings.session = req.session.connectedUserInformation;
        settings.session.allowed = req.session.allowed;
        settings.session.expiredSession = false;
        settings.settings = properties.frontend;
        responseUtil.createJsonResponse(settings, req, res);
      } else {
        var settings = {};
        settings.session = {};
        settings.session.expiredSession = true;
        responseUtil.createJsonResponse(settings, req, res);
      }
    });

    app.get('/access', function(req, res) {
      if(properties.server.enableWelcomePage === true){
        res.render("welcome.ejs", {});
      }else{
        res.redirect("/");
      }
    });
    app.get('/public/solicitudes', function(req,res){
      if(properties.server.enableWelcomePage === true){
        console.log('entro');
        res.render("reingreso.ejs",{});
      }else{
        res.redirect("/");
      }
    });

    app.get('/public/login', function(req, res) {
      if(properties.server.security.configModule.enablePublicLogin === true){
        res.render("publicLogin.ejs", {});
      }else{
        res.redirect("/");
      }
    });

    app.use(express.urlencoded({extended:false}))

    app.post('/public/login', function(req, res) {
      if(properties.server.security.configModule.enablePublicLogin === true){
        logger.error("Public login is enabled")
        var requestId = getRequestId(req)
        var params = {
          "email": req.body.publicEmail, 
          "password": req.body.publicPassword
        }

        publicLoginRestClient.authenticate(params, requestId, function (error, response) {
          if(response !== null){
            logger.info("Sending to horus/public/login in horusOauthSecurityStrategy")
            req.session.publicUserInformation = response;
            res.redirect("/horus/public/login")
          } else {
            logger.error(error)
            res.redirect("/public/login");
          }
        })

      }else{
        logger.error("Public login is disabled")
        res.redirect("/");
      }
    });

    app.post('/public/solicitudes', function(req, res) {
      console.log('entro al post');
      if(properties.server.security.configModule.enablePublicLogin === true){
        logger.error("Public access to solicitudes is enabled")
        var requestId = getRequestId(req)
        var reCaptchaIsValid = false
        const response_key = req.body["g-recaptcha-response"];
        // Put secret key here, which we get from google console
        const secret_key = "6Lc0d1sjAAAAAEwMoQpsdg5M3YsBbgW4aB-b5HMn";
      
        // Hitting POST request to the URL, Google will
        // respond with success or error scenario.
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;
        logger.info(url);
        // Making POST request to verify captcha
        
        validationRecaptcha(url).then(
          response => {
            reCaptchaIsValid=response;
            if(reCaptchaIsValid){
              logger.error(req.body);
              var params = {
                "codeStudent": req.body.codeStudent, 
                "docIdentidad": req.body.docIdentidad,
                "correoPersonal": req.body.correoPersonal,
                "tipoDocument": req.body.tipoDocument
              }
      
              publicSolictudRestClient.authenticate(params, requestId, function (error, response) {
                if(response !== null && response.cumpleValidacion){
                  console.log(response);
                  logger.info("Sending to horus/public/login in horusOauthSecurityStrategy")
                  req.session.publicUserInformation = response;
                  res.redirect("/horus/solicitud/login")
                } else {
                  logger.error(error)
                  res.redirect("/public/solicitudes");
                }
              })
      
            }

          });
        
      }else{
        logger.error("Public access to solicitudes is disabled")
        res.redirect("/");
      }
    });

    app.get('/signin', function(req, res) {
      logger.debug("/signin started")
      if(properties.server.enableWelcomePage === true){
        req.session.hasAlreadyEntered = true;
        req.session.signinStarted = true;
        logger.debug("no welcome page was enabled")
        res.redirect("/");
      }else{
        res.redirect("/");
      }
    });

    /* serve rest of web assets*/
    app.use('/', hasProtectedAccess, express.static(geoFrontServerBundlePath));

    app.get("*", hasProtectedAccess, function(req, res) {
      res.sendFile('/index.html', { root: geoFrontServerBundlePath })
    });

  }

  function getRequestId(req) {
    if (sessions && req.sessionID && typeof sessions[req.sessionID] !== 'undefined') {
      return sessions[req.sessionID];
    } else {
      return uuid.v4();
    }
  }
  function validationRecaptcha(url){
    return fetch(url, {
      method: "post",
    })
      .then((response) => response.json())
      .then((google_response) => {
        return google_response.success;
      })
      .catch((error) => {
          logger.error(error);
        return res.json({ error ,reCaptchaIsValid});
      });
  }

  function sendFile(res, commmonPagesPath, commonPage){
    if(commmonPagesPath.startsWith(".")){
      res.sendFile(commmonPagesPath + '/internalError.html',{ root: geoFrontServerHomePath })
    }else{
      res.sendFile(commmonPagesPath + commonPage)
    }
  }

  function isAllowedDomain (domain, listDomains){
    logger.debug("isAllowedDomain referer:", domain)
    if(domain == null) return false;

    let allowed = false;
    listDomains.split(",").forEach(dom => {
        logger.debug("isAllowedDomain foreach -> ", dom)
        let re = new RegExp(dom);
        allowed = allowed || re.test(domain)
    });

    return allowed;
  }

}

inheritsFrom(StaticServerConfigurator, NodejsInjectableModule);
module.exports = StaticServerConfigurator;
