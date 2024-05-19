module.exports = function (RED) {
  'use strict';
  var jsforce = require('jsforce');


  function SalesforceQueryNode(config) {
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
//   let node = this; 
//   this.on('input', function(msg, send, done) {
    
//     console.log(msg);

//     msg.payload = 'success'; 
    
//     send(msg); 

//     done();
// });

  RED.nodes.registerType('salesforce-query', SalesforceQueryNode);
};
