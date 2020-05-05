#!/usr/bin/env node
const CommandLineArgumentsHelper = require('./common/cli/CommandLineArgumentsHelper.js');
CommandLineArgumentsHelper.configureGlobalParameters(process.argv, __dirname);

//expose global variable : logger
const logger = require('./common/log/Logger.js');
global.logger = logger;

const express = require('express');
const app = express();
const session = require('express-session');
const uuid = require('uuid');
global.sessions = {};

var httpContext = require('express-http-context');
app.use(httpContext.middleware);

//ejs for error page with variables
var ejs = require('ejs');
app.set('view engine', 'ejs');

//expose modules as global variables to easy access witout require
const JavascriptModulesDiscover = require('./common/advanced/injection/JavascriptModulesDiscover.js');
JavascriptModulesDiscover.scan(geoFrontServerHomePath, ["server.js", "build"]);

//expose application.json values as global variable: properties
propertiesReader.registerFromJsonFile(geoFrontServerConfigurationsFilePath, "utf8");
console.log("properties:");
console.log(JSON.stringify(properties, null, 4));

app.use(session({
  secret: uuid.v4(),
  resave: true,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    secure: false,
    maxAge: (properties.server.serverExpirationTime * 1000)
  }
}));

//initialize request id
app.use(function(req, res, next) {
  if(!sessions[req.sessionID]){
    sessions[req.sessionID] = uuid.v4();
  }
  httpContext.set('X-REQUEST-ID', sessions[req.sessionID]);
  next();
});

app.set('views', geoFrontServerCommonPagesPath);

var port = process.env.PORT || 2708;

staticServerConfigurator.start(express, app);

// start server
app.listen(port, function() {
  logger.info('App is running on port ' + port);
});
