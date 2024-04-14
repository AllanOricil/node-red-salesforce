module.exports = function (RED) {
  'use strict';
  var jsforce = require('jsforce');

  function SalesforceConnectionNode(config) {
    RED.nodes.createNode(this, config);
    if (
      this.credentials.username &&
      this.credentials.password &&
      this.credentials.connectedAppClientId &&
      this.credentials.connectedAppClientSecret
    ) {
      this.oauth = {
        loginUrl: this.credentials.instanceUrl,
        clientId: this.credentials.connectedAppClientId,
        clientSecret: this.credentials.connectedAppClientSecret,
      };

      this.connection = new jsforce.Connection({
        oauth2: this.oauth,
      });

      var self = this;

      this.connection.login(
        this.credentials.username,
        this.credentials.password,
        function (err, userInfo) {
          console.log(self.connection.accessToken);
          console.log(self.connection.instanceUrl);
          console.log('User ID: ' + userInfo.id);
          console.log('Org ID: ' + userInfo.organizationId);
        },
      );
    }
  }

  RED.nodes.registerType('salesforce-connection', SalesforceConnectionNode, {
    connection: {
      username: { type: 'text' },
      password: { type: 'password' },
      connected_app_client_id: { type: 'password' },
      connected_app_client_secret: { type: 'password' },
    },
  });
};
