var BasicSecurityClient = require('./client/BasicSecurityClient.js');

function BasicSecurityStrategy(expressServer, options) {

  var _this = this;
  var basicSecurityClient = new BasicSecurityClient(options);

  // method required
  this.ensureAuthenticated = function(req, res, next) {

    if (!req.session || (typeof req.session === 'undefined')) {
      throw new Error("Session is not properly configured");
    }

    if (req.session.connectedUserInformation) {
      //User is already logged in
      logger.info("User is logged in");
      return next();
    } else {
      logger.info("User not logged in");

      var credentials = getCredentialsFromBasicAuth(req);

      if(credentials) {
        basicSecurityClient.authenticate(credentials, function(authenticateErr, successUrl) {

          if (authenticateErr) {
            logger.info(authenticateErr);
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate',
            'Basic realm="The username and password you entered did not match our records. Please double-check and try again."');
            res.end("Basic auth required");
            return;
          }

          logger.info("Redirect url: " + successUrl);
          req.session.connectedUserInformation = {user:credentials.user};
          req.session.save();
          res.redirect(successUrl);
          return;
        });
      } else {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate',
        'Basic realm="The username and password you entered did not match our records. Please double-check and try again."');
        res.end("Basic auth credentials are required");
        return;
      }
    }
  }
}

function getCredentialsFromBasicAuth(req) {
  var authHeader = req.headers['authorization'];
  logger.info("Authorization Header: "+ authHeader);

  if(authHeader) {
    var [type, token] = authHeader.split(' ');
    logger.info("Authorization Type: "+ type);
    logger.info("Authorization Token: "+ token);
    var [user, password] = Buffer.from(token, 'base64').toString().split(':');
    return {
      user: user,
      password: password,
    };
  }

  return false;
}

module.exports = BasicSecurityStrategy;
