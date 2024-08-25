import { Node } from '@allanoricil/node-red-node';

export default class Query extends Node {
  constructor(config) {
    super(config);

    this.salesforceConnectionNode = Query.RED.nodes.getNode(
      this.config.connection,
    );
  }

  async onInput(msg, send, done) {
    if (!this.salesforceConnectionNode) {
      this.error('No connection node configured.', msg);
      done(); // Ensure done is called to signal completion
      return; // Exit the function early
    }
    let connection = await this.salesforceConnectionNode.getConnection();

    if (!connection) {
      this.error('Failed to establish a connection to Salesforce', msg);
      done(); // Ensure done is called to signal completion
      return; // Exit the function early
    }

    let query = this.config.query;
    // use msg query if SOQL, otherwise use node query
    if (
      typeof msg.payload === 'string' &&
      msg.payload.trim().toLowerCase().startsWith('select')
    ) {
      query = msg.payload;
    }

    // set the query to the message for later reference in a flow
    msg.query = query;

    // Output Style "messageAllRecords" do Query and return records
    if (this.config.outputStyle == 'messageAllRecords') {
      try {
        let result = await connection.query(query);
        msg = {
          totalSize: result.totalSize,
          done: result.done,
          payload: result.records,
        };
        send(msg);
        done();
      } catch (error) {
        this.error('Error executing Salesforce query: ' + error.message, msg);
        done();
      }
    }

    // Output Style "messagePerRecord" do Query and return records
    if (this.config.outputStyle == 'messagePerRecord') {
      try {
        // Start the query and set up the stream handlers
        let stream = connection
          .query(query)
          .on('record', async (record) => {
            let newMsg = Query.RED.util.cloneMessage(msg); // Clone the message for each record
            newMsg = {
              totalSize: stream.totalSize,
              totalFetched: stream.totalFetched,
              payload: record,
            };
            // delay between emitting each record in ms, set in node config
            // setTimeout(() => {
            //   send(newMsg);
            // }, this.config.delay);
            // await new Promise(resolve => setTimeout(resolve, this.config.delay));
            send(newMsg);
          })
          .on('end', () => {
            console.log(
              'Query completed. Total records fetched:',
              stream.totalFetched,
            );
            let endMsg = Query.RED.util.cloneMessage(msg);
            endMsg = {
              totalSize: stream.totalSize,
              totalFetched: stream.totalFetched,
              payload: 'Done',
            };
            // Output endmessage in stream or in seperate output node or null (none, no endmessage)
            send(
              this.config.endMessage == 'inNodeOutput'
                ? [null, endMsg]
                : this.config.endMessage == 'inStream'
                  ? endMsg
                  : null,
            );
            done(); // Call done only when the stream ends
          })
          .on('error', (err) => {
            this.error('Error during Salesforce query stream: ' + err, msg);
            done(); // Ensure done is also called on error
          })
          .run({ autoFetch: true, maxFetch: this.config.maxFetch }); // This actually starts the query stream
      } catch (error) {
        this.error(
          'Error setting up Salesforce query stream: ' + error.message,
          msg,
        );
        done();
      }
      done(); // Ensure done is always called to signal the end of processing
    }
  }
}
