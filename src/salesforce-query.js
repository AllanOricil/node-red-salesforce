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
      let query; 
      // use msg query if SOQL, otherwise use node query
      if (typeof msg.payload === 'string' && msg.payload.trim().toLowerCase().startsWith("select")) {
        query = msg.payload;
      }else {
        query = config.query
      }
      msg.query = query; 
      msg.payload = `Executing query: ${query}`
      send(msg);
      done();
    });



  }

  RED.nodes.registerType('salesforce-query', SalesforceQueryNode);
};
