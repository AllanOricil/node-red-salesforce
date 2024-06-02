module.exports = function (RED) {
  'use strict';
  var jsforce = require('jsforce');

  function SalesforceQueryNode(config) {
    RED.nodes.createNode(this, config);
    const salesforceConnectionNode = RED.nodes.getNode(config.connection);
    var node = this; // referencing the current node 

    this.on('input', async function(msg, send, done) {
      if (!salesforceConnectionNode) {
        node.error("No connection node configured.", msg);
        done(); // Ensure done is called to signal completion
        return; // Exit the function early
      }

      try {
        const connection = await salesforceConnectionNode.getConnection();

        if (!connection) {
          node.error("Failed to establish a connection to Salesforce", msg);
          done(); // Ensure done is called to signal completion
          return; // Exit the function early
        }

        let query = config.query; 
        // use msg query if SOQL, otherwise use node query
        if (typeof msg.payload === 'string' && msg.payload.trim().toLowerCase().startsWith("select")) {
          query = msg.payload;
        }

        // set the query to the message for later reference in a flow
        msg.query = query; 
        // Do the actual query 
        let result = await connection.query(query);
  
        msg.payload = result; 
        send(msg);
      } catch (error) {
        node.error("Error executing Salesforce query: " + error.message, msg);
      }
      done(); // Ensure done is always called to signal the end of processing
    });

  }


  RED.nodes.registerType('salesforce-query', SalesforceQueryNode);
};
