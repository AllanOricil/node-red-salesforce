module.exports = function (RED) {
  'use strict';
  var jsforce = require('jsforce');

  function SalesforceConnectionNode(config) {
    RED.nodes.createNode(this, config);
    if (
      this.credentials.username &&
      this.credentials.password &&
      this.credentials.connected_app_client_id &&
      this.credentials.connected_app_client_secret
    ) {
      this.oauth = {
        loginUrl: config.instance_url || 'https://login.salesforce.com',
        clientId: this.credentials.connected_app_client_id,
        clientSecret: this.credentials.connected_app_client_secret,
      };

      this.connection = new jsforce.Connection({
        oauth2: this.oauth,
      });
    }
  }

  RED.nodes.registerType('salesforce-connection', SalesforceConnectionNode, {
    credentials: {
      username: { type: 'text', required: true },
      password: { type: 'password', required: true },
      connected_app_client_id: { type: 'password', required: true },
      connected_app_client_secret: { type: 'password', required: true },
    },
  });


};
