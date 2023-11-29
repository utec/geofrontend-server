"use strict";
const PublicLoginRestClient = require('../login/PublicLoginRestClient.js');
var httpContext = require('express-http-context');
var path = require('path');
const uuid = require('uuid');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const url = require('url');
var jp = require('jsonpath');

function StaticServerConfigurator() {

  this.start = function (express, app) {

    var publicLoginRestClient = new PublicLoginRestClient(properties.server.security.configModule.publicLoginBaseUrl);

    logger.info("Security:" + (properties.server.security.enable));

    if (properties.server.security.enable === "undefined") {
      throw Error("security enable property is not configured. Security autoconfiguration is not possible .");
    }

    securityConfigurator.initialize(properties.server.security, app);

    var getCheckEmail = async function (req, res, next) {
      logger.info("GET CHECK EMAIL")
      req.session.idOpportunityGetCheckEmail = true

      var urlEndpoint = properties.server.security.configModule.paymentDebtApi.baseUrl + properties.server.security.configModule.paymentDebtApi.endpointKushkiOpportunityEmail
      logger.info("endpoint: " + urlEndpoint)
      try {
        await axios({
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + req.session.connectedUserInformation.tokenV2
          },
          url: urlEndpoint,
          data: { 'idOpportunity': req.session.idOpportunity },
        })
          .then(function (response) {
            logger.info("Response Check email: ")
            logger.info(response.data.content)
            req.session.errorGetOpportunity = false
            req.session.emailOpportunityData = response.data.content
          })
          .catch(function (err) {
            logger.error(err.stack);
            if (err.response && err.response.data && err.response.status && err.response.data.message) {
              logger.error("Error: " + err.response.data.status + ", message:" + err.response.data.message);
            }
            req.session.errorGetOpportunity = true
            //res.redirect("/dashboard?" + "transactionStatus=DECLINED&error=" + err.message)

          });
      } catch (globalErr) {
        logger.error(globalErr.stack);
        req.session.errorGetOpportunity = true
        //res.redirect("/dashboard?" + "transactionStatus=DECLINED&error=" + globalErr.message)
      }


      return;
    }

    var hasProtectedAccess = async function (req, res, next) {
      if (req.query.idOpportunity !== undefined) {
        req.session.idOpportunity = req.query.idOpportunity
        req.session.idOpportunityGetCheckEmail = false
      }

      logger.debug("requested resource:" + req.originalUrl);

      // set referer on req session
      if (properties.server.allowedDomains !== undefined) {
        var referer = req.get('Referrer') || req.get('Referer')
        logger.debug("referer: ", referer)
        if (isAllowedDomain(referer, properties.server.allowedDomains)) {
          req.session.allowed = true
        }
      }

      // set originalUrl if startsWith "dashboard?" (query param)
      if (req.originalUrl.startsWith("/dashboard?")) {
        req.session.originalUrl = req.originalUrl;
      }

      // comes from
      // - /
      // - /settings.json
      // - /signin
      // - /whatever/../../

      //just for settigns.json
      if (req.path.endsWith("/settings.json")) {
        //not a session
        if (!req.session.connectedUserInformation) {
          var settings = {};
          settings.session = {};
          settings.session.expiredSession = true;
          responseUtil.createJsonResponse(settings, req, res);
          return;
        }
        // comes from settings and has a valid session, go to hasProtectedAccess validation
      } else {
        //any other request
        //has almost one access and sign button was pressed
        logger.debug("req.session.hasAlreadyEntered:" + req.session.hasAlreadyEntered)
        logger.debug("req.session.signinStarted:" + req.session.signinStarted)
        if (typeof req.session.hasAlreadyEntered === 'undefined' || typeof req.session.signinStarted === 'undefined') {
          if (properties.server.enableWelcomePage === true) {
            req.session.hasAlreadyEntered = true;
            res.redirect("/access");
            return;
          }
        }
      }

      logger.debug("validating protected access:" + req.originalUrl)
      try {
        if (req.session.idOpportunity !== undefined && !req.session.idOpportunityGetCheckEmail) {
          await getCheckEmail(req, res, next)
        }
        securityConfigurator.hasProtectedAccess(req, res, next);
      } catch (error) {
        logger.error("requested resource:" + req.originalUrl + " | " + error.code + ": " + error.message);
        res.redirect("/error");
      }
    };

    // data from server  to frontend
    // here call to internal systems or whatever to get data
    app.get('/error', function (req, res) {
      res.render("error.ejs", {
        request_id: sessions[req.sessionID]
      });
    });


    if (properties.server.logout && properties.server.logout.length > 0) {
      logger.info("logout is enabled:" + properties.server.logout);
      app.get(properties.server.logout, function (req, res) {
        logger.info("logout");
        req.session.destroy();
        res.redirect("/");
      });
    }

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // data from server  to frontend
    // here call to internal systems or whatever to get data
    app.get('/settings.json', hasProtectedAccess, function (req, res) {
      if (req.session.connectedUserInformation && (req.session.data || req.session.idOpportunity)) {
        var settings = {};
        settings.session = {};
        settings.session = req.session.connectedUserInformation;
        settings.session.allowed = req.session.allowed;
        settings.session.expiredSession = false;
        settings.settings = properties.frontend;

        if (req.session.data) {
          settings.data = req.session.data;
          settings.idOpportunity = undefined;
        }

        if (req.session.idOpportunity) {
          settings.opportunity = {}
          settings.opportunity.id = req.session.idOpportunity
          settings.opportunity.error = req.session.errorGetOpportunity
          settings.opportunity.emailData = req.session.emailOpportunityData
          settings.data = undefined;
        }

        if (req.session.errorValidationCode) {
          settings.errorValidationCode = req.session.errorValidationCode
        }
        if(req.session.validationCode != undefined) {
          settings.validationCode = req.session.validationCode
          settings.validationCode.validationCodeRequest = req.session.validationCodeRequest
        }

        responseUtil.createJsonResponse(settings, req, res);
      } else {
        var settings = {};
        settings.session = {};
        settings.session.expiredSession = true;
        responseUtil.createJsonResponse(settings, req, res);
      }
    });

    app.get('/access', function (req, res) {
      if (properties.server.enableWelcomePage === true) {
        req.session.publicUserInformation = {}
        req.session.publicUserInformation.tokenV1 = "";
        req.session.publicUserInformation.email = "";
        req.session.publicUserInformation.name = "";
        req.session.publicUserInformation.id = "";
        req.session.publicUserInformation.lastname = "";
        res.redirect("/horus/public/login")
        //res.render("welcome.ejs", {});
      } else {
        res.redirect("/");
      }
    });

    app.get('/public/login', function (req, res) {
      if (properties.server.security.configModule.enablePublicLogin === true) {
        res.render("publicLogin.ejs", {});
      } else {
        res.redirect("/");
      }
    });

    app.use(express.urlencoded({ extended: false }))

    app.post('/public/login', function (req, res) {
      if (properties.server.security.configModule.enablePublicLogin === true) {
        logger.error("Public login is enabled")
        var requestId = getRequestId(req)
        var params = {
          "email": req.body.publicEmail,
          "password": req.body.publicPassword
        }

        publicLoginRestClient.authenticate(params, requestId, function (error, response) {
          if (response !== null) {
            logger.info("Sending to horus/public/login in horusOauthSecurityStrategy")
            req.session.publicUserInformation = response;
            res.redirect("/horus/public/login")
          } else {
            logger.error(error)
            res.redirect("/public/login");
          }
        })

      } else {
        logger.error("Public login is disabled")
        res.redirect("/");
      }
    });


    app.get('/signin', function (req, res) {
      logger.debug("/signin started")
      if (properties.server.enableWelcomePage === true) {
        req.session.hasAlreadyEntered = true;
        req.session.signinStarted = true;
        logger.debug("no welcome page was enabled")
        res.redirect("/");
      } else {
        res.redirect("/");
      }
    });

    /* Get data from post */
    app.post('/data', function (req, res) {
      logger.info("/data getting data from post")
      if (properties.server.enableWelcomePage === true) {
        logger.info(req.body)
        req.session.data = req.body;
        req.session.idOpportunity = undefined;
        res.redirect("/");
      } else {
        res.redirect("/");
      }
    });

    //req.session.debts = [{ "externalId": 45656 }, { "externalId": 654654 }]
    /* check email from opportunity */
    app.post('/opportunity/email', function (req, res) {
      logger.info(req.body)

    });

    app.post('/payment/validate/code', async function (req, res) {
      logger.info("post payment validate code" + req.body.code)
      res.set('Content-Type', 'text/html');

      var urlEndpoint = properties.server.security.configModule.paymentDebtApi.baseUrl + properties.server.security.configModule.paymentDebtApi.endpointKushkiOpportunityValidateCode
      logger.info("endpoint: " + urlEndpoint)
      req.session.validationCodeRequest = req.body.code
      try {
        await axios({
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + req.session.connectedUserInformation.tokenV2
          },
          url: urlEndpoint,
          data: { 'idOpportunity': req.session.idOpportunity, 'code': req.body.code, 'test': 'test' },
        })
          .then(function (response) {
            logger.info("Response validate code: ")
            logger.info(response.data.content)
            req.session.errorValidationCode = response.data.content.error

            var content = { errorValidationCode: response.data.content.error }

            if (response.data.content.error) {
              res.send(JSON.stringify(content));
            } else {
              getDebts(req.session.idOpportunity, req, res)
            }


          })
          .catch(function (err) {
            logger.error(err.stack);
            if (err.response && err.response.data && err.response.status && err.response.data.message) {
              logger.error("Error: " + err.response.data.status + ", message:" + err.response.data.message);
            }
            var content = { errorValidationCode: true }
            res.send(JSON.stringify(content));

          });
      } catch (globalErr) {
        logger.error(globalErr.stack);
        req.session.errorValidationCode = true
        var content = { errorValidationCode: true }
        res.send(JSON.stringify(content));
      }



    })

    /*pasarela*/
    app.post(properties.server.security.configModule.pasarelaFormEndpoint !== undefined ?
      "/" + properties.server.security.configModule.pasarelaFormEndpoint : "/pasarela", function (req, res) {
        if (properties.server.security.configModule.pasarelaActive !== undefined &&
          properties.server.security.configModule.pasarelaActive) {

          logger.info("#### pasarela ####")
          var urlEndpoint = properties.server.security.configModule.paymentDebtApi.baseUrl + properties.server.security.configModule.paymentDebtApi.endpointKushkiPayment
          logger.info("-- post to: " + urlEndpoint)
          try {
            axios({
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + req.session.connectedUserInformation.tokenV2
              },
              url: urlEndpoint,
              data: req.body,
            })
              .then(function (response) {
                logger.info(response.data.content)

                if (!response || (typeof response === 'undefined')) {
                  return callback("Endpoint " + urlEndpoint + " http response is wrong.", null);
                }

                if (!response.data || (typeof response.data === 'undefined')) {
                  return callback("Endpoint " + urlEndpoint + " http response body is null, empty or wrong.", null);
                }

                var status = jp.query(response.data, '$.status');


                if (status != "200" && status != "400") {
                  var transactionStatus = response.data.content.details.transactionStatus
                  var responseText = response.data.content.details.responseText
                  return callback("Endpoint " + urlEndpoint + " json response contains [status] different to 200 and 400:" + JSON.stringify(response.data), null);
                }

                var transactionStatus = response.data.content.details.transactionStatus
                var responseText = response.data.content.details.responseText
                var ticketNumber = response.data.content.ticketNumber
                var transactionReference = response.data.content.details.transactionReference !== undefined
                  ? response.data.content.details.transactionReference : ""
                var currency = response.data.content.details.amount.currency
                var approvedTransactionAmount = response.data.content.details.approvedTransactionAmount !== undefined
                  ? response.data.content.details.approvedTransactionAmount : ""
                var paymentBrand = response.data.content.details.paymentBrand !== undefined
                  ? response.data.content.details.paymentBrand : ""

                res.redirect("/dashboard?" + "transactionStatus=" + transactionStatus +
                  "&responseText=" + responseText +
                  "&ticketNumber=" + ticketNumber +
                  "&transactionReference=" + transactionReference +
                  "&currency=" + currency +
                  "&approvedTransactionAmount=" + approvedTransactionAmount +
                  "&paymentBrand=" + paymentBrand +
                  "&pasarelaDescription=" + req.body.pasarelaDescription)
                //return callback(null, response.data.content);

              })
              .catch(function (err) {
                logger.error(err.stack);
                if (err.response && err.response.data && err.response.status && err.response.data.message) {
                  logger.error("Error: " + err.response.data.status + ", message:" + err.response.data.message);
                }
                res.redirect("/dashboard?" + "transactionStatus=DECLINED&error=" + err.message)
              });
          } catch (globalErr) {
            logger.error(globalErr.stack);
            res.redirect("/dashboard?" + "transactionStatus=DECLINED&error=" + globalErr.message)
          }
        } else {
          res.redirect("/")
        }

      })

    /* serve rest of web assets*/
    app.use('/', hasProtectedAccess, express.static(geoFrontServerBundlePath));

    app.get("*", hasProtectedAccess, function (req, res) {
      res.sendFile('/index.html', { root: geoFrontServerBundlePath })
    });

  }

  async function getDebts(idOpportunity, req, res) {

    var urlEndpoint = properties.server.security.configModule.paymentDebtApi.baseUrl + properties.server.security.configModule.paymentDebtApi.endpointKushkiOpportunityDebts
    logger.info("-- post to get debts: " + urlEndpoint)

    await axios({
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + req.session.connectedUserInformation.tokenV2
      },
      url: urlEndpoint,
      data: { 'idOpportunity': idOpportunity },
    })
      .then(function (response) {
        logger.info("Response get debts: ")
        logger.info(response.data.content)

        var content = { errorValidationCode: false, errorGetDebts: false, debts: response.data.content  }
        req.session.validationCode = content
        res.send(JSON.stringify(content));
      })
      .catch(function (err) {
        logger.error(err.stack);
        if (err.response && err.response.data && err.response.status && err.response.data.message) {
          logger.error("Error: " + err.response.data.status + ", message:" + err.response.data.message);
        }

        var content = { errorValidationCode: false, errorGetDebts: true, debts: null  }
        res.send(JSON.stringify(content));

      });
  }

  function getRequestId(req) {
    if (sessions && req.sessionID && typeof sessions[req.sessionID] !== 'undefined') {
      return sessions[req.sessionID];
    } else {
      return uuid.v4();
    }
  }

  function sendFile(res, commmonPagesPath, commonPage) {
    if (commmonPagesPath.startsWith(".")) {
      res.sendFile(commmonPagesPath + '/internalError.html', { root: geoFrontServerHomePath })
    } else {
      res.sendFile(commmonPagesPath + commonPage)
    }
  }

  function isAllowedDomain(domain, listDomains) {
    logger.debug("isAllowedDomain referer:", domain)
    if (domain == null) return false;

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
