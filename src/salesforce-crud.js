module.exports = function (RED) {
  'use strict';
  var jsforce = require('jsforce');

  function SalesforceCRUDNode(config) {
    RED.nodes.createNode(this, config);
    const salesforceConnectionNode = RED.nodes.getNode(config.connection);
    var node = this; // referencing the current node 

    this.on('input', async function(msg, send, done) {
      if (!salesforceConnectionNode) {
        node.error("No connection node configured.", msg);
        done(); // Ensure done is called to signal completion
        return; // Exit the function early
      }
        let connection = await salesforceConnectionNode.getConnection();

        if (!connection) {
          node.error("Failed to establish a connection to Salesforce", msg);
          done(); // Ensure done is called to signal completion
          return; // Exit the function early
        }



      done(); // Ensure done is always called to signal the end of processing
        }); 

  }


  RED.nodes.registerType('CRUD', SalesforceCRUDNode);
};
