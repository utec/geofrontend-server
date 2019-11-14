#!/usr/bin/env node

const CommandLineArgumentsHelper = require('./common/cli/CommandLineArgumentsHelper.js');
CommandLineArgumentsHelper.configureGlobalParameters(process.argv, __dirname);

const express = require('express');
const app = express();
const session = require('express-session');
var cookieParser = require('cookie-parser');
const uuid = require('uuid');
const logger = require('./common/log/Logger.js');

global.logger = logger;

app.use(cookieParser());

app.use(session({
  secret: uuid.v4(),
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: (45 * 60 * 1000)
  }
}));

const JavascriptModulesDiscover = require('./common/advanced/injection/JavascriptModulesDiscover.js');

var port = process.env.PORT || 2708;

JavascriptModulesDiscover.scan(geoFrontServerHomePath, ["server.js", "build"]);

propertiesReader.registerFromJsonFile(geoFrontServerConfigurationsFilePath, "utf8");

staticServerConfigurator.start(express, app);

// start server
app.listen(port, function() {
  logger.info('App is running on port ' + port);
});
