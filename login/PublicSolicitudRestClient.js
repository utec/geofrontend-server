const axios = require('axios');
var jp = require('jsonpath');

function PublicSolicitudRestClient(baseUrl) {

    var authenticateEndpoint = baseUrl + '/publicAccess/validation';

    this.authenticate = function (params, requestId, callback) {

        logger.debug(params);

        try {
            logger.info("Public solicitud endpoint " + authenticateEndpoint)
            axios({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'X-UTEC-REQUEST-ID': requestId,
                    'X-UTEC-CONSUMER-ID': 'FINANCE-HELP-WEB'
                },
                url: authenticateEndpoint,
                data: params,
            })
                .then(function (response) {

                    if (!response || (typeof response === 'undefined')) {
                        return callback("Public solicitud endpoint " + authenticateEndpoint + " http response is wrong.", null);
                    }

                    if (!response.data || (typeof response.data === 'undefined')) {
                        return callback("Public solicitud endpoint " + authenticateEndpoint + " http response body is null, empty or wrong.", null);
                    }

                    var status = jp.query(response.data, '$.status');

                    if (status != "200") {
                        return callback("Public solicitud endpoint " + authenticateEndpoint + " json response contains [status] different to 200:" + JSON.stringify(response.data), null);
                    }

                    return callback(null, response.data.content);

                })
                .catch(function (err) {
                    logger.error(err.stack);
                    if (err.response && err.response.data && err.response.status && err.response.data.message) {
                        logger.error("Error: " + err.response.data.status + ", message:" + err.response.data.message);
                    }
                    return callback("Authenticate Public solicitud Endpoint is down or " + authenticateEndpoint + " does not respond: " + err.message, null);
                });
        } catch (globalErr) {
            logger.error(globalErr.stack);
            return callback("Error when consuming PublicSolicitudRestClient service " + authenticateEndpoint + ":" + globalErr.message, null);
        }

    }

}


module.exports = PublicSolicitudRestClient
