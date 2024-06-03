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
        let connection = await salesforceConnectionNode.getConnection();

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
          try {
            let result = await connection.query(query);
            msg.payload = result;
            send(msg);
            done();
          } catch (error) {
            node.error("Error executing Salesforce query: " + error.message, msg);
            done();
          }
        }

        // Output Style "messagePerRecord" do Query and return records
        if (config.outputStyle == 'messagePerRecord' ){
          try {
            // Start the query and set up the stream handlers
            let stream = connection.query(query)
              .on("record", (record) => {
                let newMsg = RED.util.cloneMessage(msg); // Clone the message for each record
                newMsg = { totalSize: stream.totalSize, totalFetched: stream.totalFetched };
                newMsg.payload = record;
                send(newMsg);
              })
              .on("end", () => {
                console.log("Query completed. Total records fetched:", stream.totalFetched);
                let endMsg = RED.util.cloneMessage(msg);
                endMsg = { totalSize: stream.totalSize, totalFetched: stream.totalFetched, payload: "Done" };
                // Output endmessage in stream or in seperate output node or null (none, no endmessage)
                send(config.endMessage == 'inNodeOutput' ? [null, endMsg] : (config.endMessage == 'inStream' ? endMsg : null));
                done(); // Call done only when the stream ends
              })
              .on("error", (err) => {
                node.error("Error during Salesforce query stream: " + err, msg);
                done(); // Ensure done is also called on error
              })
              .run({ autoFetch : true, maxFetch : 4000 }); // This actually starts the query stream
          } catch (error) {
            node.error("Error setting up Salesforce query stream: " + error.message, msg);
            done();
          }
      done(); // Ensure done is always called to signal the end of processing
        }; 
    });

  }


  RED.nodes.registerType('salesforce-query', SalesforceQueryNode);
};
