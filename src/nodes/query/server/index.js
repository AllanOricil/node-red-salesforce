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
      done();
      return;
    }
    let connection = await this.salesforceConnectionNode.getConnection();

    if (!connection) {
      this.error('Failed to establish a connection to Salesforce', msg);
      done();
      return;
    }

    let query = this.config.query;
    if (
      typeof msg.payload === 'string' &&
      msg.payload.trim().toLowerCase().startsWith('select')
    ) {
      query = msg.payload;
    }

    msg.query = query;

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

    if (this.config.outputStyle == 'messagePerRecord') {
      try {
        let stream = connection
          .query(query)
          .on('record', async (record) => {
            let newMsg = Query.RED.util.cloneMessage(msg);
            newMsg = {
              totalSize: stream.totalSize,
              totalFetched: stream.totalFetched,
              payload: record,
            };
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
            send(
              this.config.endMessage == 'inNodeOutput'
                ? [null, endMsg]
                : this.config.endMessage == 'inStream'
                  ? endMsg
                  : null,
            );
            done();
          })
          .on('error', (err) => {
            this.error('Error during Salesforce query stream: ' + err, msg);
            done();
          })
          .run({ autoFetch: true, maxFetch: this.config.maxFetch });
      } catch (error) {
        this.error(
          'Error setting up Salesforce query stream: ' + error.message,
          msg,
        );
        done();
      }
      done();
    }
  }
}
