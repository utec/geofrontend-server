"use strict";

var BasicSecurityStrategy = require('./BasicSecurityStrategy');

function BasicSecurityClientPlugin() {

  this.getSecurityStrategy = function(expressIntance, options) {
    return new BasicSecurityStrategy(expressIntance, options);
  }
}

module.exports = BasicSecurityClientPlugin;
