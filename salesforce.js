module.exports = function (RED) {
  'use strict';
  var jsforce = require('jsforce');

  function SalesforceCredentialsNode(config) {
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

  RED.nodes.registerType('salesforce-credentials', SalesforceCredentialsNode, {
    credentials: {
      username: { type: 'text', required: true },
      password: { type: 'password', required: true },
      connected_app_client_id: { type: 'password', required: true },
      connected_app_client_secret: { type: 'password', required: true },
    },
  });

  function SalesforceSoqlNode(config) {
    RED.nodes.createNode(this, config);
    this.active = true;
    this.connection = config.connection;
    this.soql = config.soql || '';

    const connectionConfig = RED.nodes.getNode(this.connection);
    const credentials = RED.nodes.getCredentials(this.connection);

    if (connectionConfig && connectionConfig.oauth) {
      this.log(connectionConfig);
      this.log(credentials);
    } else {
      this.error(RED._('salesforce.errors.missingcredentials'));
    }
  }

  RED.nodes.registerType('soql', SalesforceSoqlNode);
};
