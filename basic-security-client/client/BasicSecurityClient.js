function BasicSecurityClient(options) {

  this.authenticate = function(params, callback) {
    logger.info("Trying to authenticate... ");
    const user      = params.user;
    const password  = params.password;

    if(options.user === user && options.password === password) {
      logger.info("Successfull logged in.");
      return callback(null, "/");
    } else {
      return callback("Wrong user or password... try again.", null);
    }
  }
}

module.exports = BasicSecurityClient;