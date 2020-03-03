var httpContext = require('express-http-context');
var log4js = require('log4js');
var logger = log4js.getLogger();

log4js.configure({
  appenders: {
    everything: { type: 'dateFile', filename: process.env.LOG_PATH, pattern: '-yyyy-MM-dd', keepFileExt: true },
    out: { type: 'stdout' }
  },
  categories: {
    default: { appenders: [ 'everything','out' ], level: process.env.LOG_LEVEL }
  }
});

function getCalleeInfo() {
  var stack = new Error().stack.split("at ");

  var functionInfo = "" + stack[3].trim();
  var fileLocation = functionInfo.substring(functionInfo.indexOf("(") + 1, functionInfo.indexOf(":"));
  var lineInfo = functionInfo.split(":");
  return {
    location: fileLocation.replace(geoFrontServerHomePath, ""),
    line: lineInfo[1]
  };
}

function Logger() {

}

Logger.info = function(message) {
  var calleeInfo = getCalleeInfo();
  logger.info(getLogEntry(calleeInfo, message));
};

Logger.debug = function(message) {
  var calleeInfo = getCalleeInfo();
  logger.debug(getLogEntry(calleeInfo, message));
};

Logger.error = function(message) {
  var calleeInfo = getCalleeInfo();
  logger.error(getLogEntry(calleeInfo, message));
};

function getLogEntry(calleeInfo, message){
  var location = calleeInfo.location;
  var line = calleeInfo.line;
  var id = httpContext .get('X-REQUEST-ID');
  var requestId = (id)?id:"";
  message = (typeof message === 'object')?JSON.stringify(message):message
  return `[${requestId}][${location}][${line}]: ${message}`
}


module.exports = Logger;
