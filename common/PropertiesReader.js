"use strict";
var fs = require('fs');

function PropertiesReader() {

  this.registerFromJsonFile = function(jsonFilepath,charset) {
    console.log(jsonFilepath);
    if (fs.existsSync(jsonFilepath)) {
      var rawJsonFile = fs.readFileSync(jsonFilepath, charset);
      var inflatedProperties = inflateEnvironmentVariables(JSON.parse(rawJsonFile));
      global.properties = inflatedProperties;
    } else {
      throw new Error("Local properties file ["+jsonFilepath+"] does not exist.");
    }

  }

}

function parseObjectProperties(obj) {
  for (var k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      parseObjectProperties(obj[k])
    } else if (obj.hasOwnProperty(k)) {
      var configInitialValue = "" + obj[k];
      if (configInitialValue.startsWith("${") && configInitialValue.endsWith("}")) {
        var configInitialValue = "" + obj[k];
        var environmentKey = configInitialValue.replace("${", "").replace("}", "");
        var finalValue = process.env[environmentKey];

        if (finalValue && finalValue!== 'undefined') {
          obj[k] = finalValue;
        }else{
          obj[k] = null;
        }
      }
    }
  }
}

function inflateEnvironmentVariables(jsonObject) {
  parseObjectProperties(jsonObject);
  return jsonObject;
}

inheritsFrom(PropertiesReader, NodejsInjectableModule);
module.exports = PropertiesReader;
