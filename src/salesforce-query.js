module.exports = function (RED) {
  'use strict';
  var jsforce = require('jsforce');


  function SalesforceQueryNode(config) {
    RED.nodes.createNode(this, config);
    this.active = true;
    this.connection = RED.nodes.getCredentials(this.connection);

    this.soql = config.soql || '';


    // if (connectionConfig && connectionConfig.oauth) {
    //   this.log(connectionConfig);
    //   this.log(credentials);
    // } else {
    //   this.error(RED._('salesforce.errors.missingcredentials'));
    // }
    let node = this;
    this.on('input', function(msg, send, done) {

        msg.payload = "succes";
        send(msg);
    

        done();
    });



  }

  RED.nodes.registerType('salesforce-query', SalesforceQueryNode);
};
