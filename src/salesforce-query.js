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

        // Output Style "messageAllRecords" do Query and return records
        if (config.outputStyle == 'messageAllRecords' ){
          let result = await connection.query(query);
    
          msg.payload = result; 
          send(msg);
        }

        // Output Style "messagePerRecord" do Query and return records
        if (config.outputStyle == 'messagePerRecord' ){
          // let result = await connection.query(query);
          const records = [];
          let stream = await connection.query(query)
            .on("record", (record) => {
              let newMsg = RED.util.cloneMessage(msg); // Clone the message for each record
              newMsg.payload = record;
              send(newMsg);
            })
            .on("end", () => {
              console.log("total in database : " + query.totalSize);
              console.log("total fetched : " + query.totalFetched);
            })
            .on("error", (err) => {
              node.error(err);
            })
            .run({ autoFetch : true, maxFetch : 4000 }); 
        }
      } catch (error) {
        node.error("Error executing Salesforce query: " + error.message, msg);
      }
      done(); // Ensure done is always called to signal the end of processing
    });

  }


  RED.nodes.registerType('salesforce-query', SalesforceQueryNode);
};
