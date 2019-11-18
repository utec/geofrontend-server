const axios = require('axios');
var jp = require('jsonpath');

function BasicSecurityClient(options) {

  this.authenticate = function(params, callback) {
    console.dir("Trying to authenticate... ");
    const user      = params.user;
    const password  = params.password;

    if(options.user === user && options.password === password) {
      return callback(null, "/panel");
    } else {
      return callback("Wrong user or password... try again.", null);
    }
  }

}


module.exports = BasicSecurityClient
