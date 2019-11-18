const axios = require('axios');
var jp = require('jsonpath');
var BasicSecurityClient = require('./client/BasicSecurityClient.js');

function BasicSecurityStrategy(expressServer, options) {

  var _this = this;
  var basicSecurityClient = new BasicSecurityClient(options);

  // method required
  this.ensureAuthenticated = function(req, res, next) {

    if (!req.session || (typeof req.session === 'undefined')) {
      throw new Error("Session is not properly configured");
    }

    console.dir(req.session);
    console.dir(req.headers);
    console.dir(req.body);
    console.dir(req.params);
    console.dir(req.query);

    if (req.session.userLoggedIn) {
      //User is already logued in
      console.log("User is logged in");
      return next();
    } else {
      console.log("user not logged in");

      //get login redirect url
      var queryParameters = {
        user: req.query.user,
        password: req.query.password,
      };

      basicSecurityClient.authenticate(queryParameters, function(getAuthorizeUrlErr, authorizeUrl) {
        if (getAuthorizeUrlErr) {
          console.log(getAuthorizeUrlErr);
          res.redirect(failureRedirectRoute);
          return;
        }
        queryParameters.name = "Nick Palomino";

        req.session.userLoggedIn = queryParameters;
        req.session.save();
        console.log("Redirect url: " + authorizeUrl);
        res.redirect("/panel");
        return;
      });
    }
  }

}

module.exports = BasicSecurityStrategy;
