"use strict";

var uuid = require('uuid');

function ResponseUtil() {

  var _this=this;

  this.createJsonResponse = function(content, req, res) {

    var response = {
      "status": 200,
      "message": "success",
      "content": content
    };

    var requestIdHeaderName = "X-REQUEST-ID";

    if(!req.headers[requestIdHeaderName]){
      res.set(requestIdHeaderName, uuid.v4());
    }
    res.json(response);
  }

}

inheritsFrom(ResponseUtil, NodejsInjectableModule);
module.exports = ResponseUtil;
