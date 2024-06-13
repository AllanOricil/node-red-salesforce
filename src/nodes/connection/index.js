import jsforce from 'jsforce';

export default function (RED) {
  function SalesforceConnectionNode(config) {
    RED.nodes.createNode(this, config);

    this.oauth2 = {
      loginUrl: config?.instance_url || 'https://login.salesforce.com',
      clientId: this.credentials?.connected_app_client_id,
      clientSecret: this.credentials?.connected_app_client_secret,
    };

    this.connection = null; // Connection stored here

    // TODO: pass several parameters to this guy to determine the type of connection it can open
    this.getConnection = async () => {
      // If no connection object, create and login
      if (!this.connection) {
        console.log('Creating new connection');
        try {
          this.connection = new jsforce.Connection({
            oauth2: this.oauth2,
          });
          await this.connection.login(
            this.credentials.username,
            this.credentials.password,
          );
        } catch (err) {
          RED.node.error(err);
        }
      }

      // Finnaly return the connection
      // TEMP for debug purpose.
      console.log('accesToken:' & this.connection.accessToken);
      console.log('refreshToken:' & this.connection.refreshToken);
      console.log('instanceUrl:' & this.connection.instanceUrl);
      return this.connection;
    };
  }

  RED.nodes.registerType('salesforce-connection', SalesforceConnectionNode, {
    credentials: {
      username: { type: 'text', required: true },
      password: { type: 'password', required: true },
      connected_app_client_id: { type: 'password', required: true },
      connected_app_client_secret: { type: 'password', required: true },
    },
  });

  // receive "test connection' button click from editor in UI"
  RED.httpAdmin.post('/salesforce/connection/test', async function (req, res) {
    try {
      const salesforceConnectionNode = RED.nodes.getNode(req.body.id);

      if (
        salesforceConnectionNode?.oauth2?.loginUrl &&
        salesforceConnectionNode?.oauth2?.clientId &&
        salesforceConnectionNode?.oauth2?.clientSecret
      ) {
        RED.log.info(
          `using deployed salesforce connection node: ${salesforceConnectionNode.name || salesforceConnectionNode.id}`,
        );
        await salesforceConnectionNode.getConnection();
      } else {
        // TODO: add ajv to validate req body
        const connection = new jsforce.Connection({
          oauth2: {
            loginUrl: req.body.instance_url,
            clientId: req.body.connected_app_client_id,
            clientSecret: req.body.connected_app_client_secret,
          },
        });

        await connection.login(req.body.username, req.body.password);
      }
    } catch (err) {
      RED.log.error('Salesforce connection failed: ' + err.message);
      return res.status(500).json({ status: 'error', message: err.message });
    }

    RED.log.info('Salesforce connection successful!');
    res
      .status(200)
      .json({ status: 'success', message: 'Connection successful' });
  });
}
