var BasicSecurityClient = require('./client/BasicSecurityClient.js');

function BasicSecurityStrategy(expressServer, options) {

  var _this = this;
  var basicSecurityClient = new BasicSecurityClient(options);

  // method required
  this.ensureAuthenticated = function(req, res, next) {

    if (!req.session || (typeof req.session === 'undefined')) {
      throw new Error("Session is not properly configured");
    }

    if (req.session.userLoggedIn) {
      //User is already logged in
      logger.info("User is logged in");
      return next();
    } else {
      logger.info("User NOT logged in");

      var userParams = getUserFromBasicAuth(req);

      if(userParams) {
        basicSecurityClient.authenticate(userParams, function(getAuthorizeUrlErr, authorizeUrl) {

          if (getAuthorizeUrlErr) {
            console.log(getAuthorizeUrlErr);
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Ingresar datos"');
            res.end("Basic auth required");
            return;
          }

          console.log("Redirect url: " + authorizeUrl);
          req.session.userLoggedIn = userParams;
          req.session.save();
          res.redirect(authorizeUrl);
          return;
        });
      } else {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Ingresar datos"');
        res.end("Basic auth required");
        return;
      }
    }
  }
}

function getUserFromBasicAuth(req) {
  var authHeader = req.headers['authorization'];
  console.log("Authorization Header: "+ authHeader);

  if(authHeader) {
    var [type, token] = authHeader.split(' ');
    console.log("Authorization Type: "+ type);
    console.log("Authorization Token: "+ token);
    //var [user, password] = atob(token).split(':');
    var [user, password] = Buffer.from(token, 'base64').toString().split(':');
    return {
      user: user,
      password: password,
    };
  }

  return false;
}

module.exports = BasicSecurityStrategy;
