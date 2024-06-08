import jsforce from 'jsforce';

export default function (RED) {
  function SalesforceConnectionNode(config) {
    RED.nodes.createNode(this, config);
    if (
      this.credentials.username &&
      this.credentials.password &&
      this.credentials.connected_app_client_id &&
      this.credentials.connected_app_client_secret
    ) {
      this.oauth = {
        loginUrl: config.instance_url || 'https://login.salesforce.com',
        clientId: this.credentials.connected_app_client_id,
        clientSecret: this.credentials.connected_app_client_secret,
      };

      this.connection = new jsforce.Connection({
        oauth2: this.oauth,
      });
    }

    this.getConnection = async function () {
      try {
        console.log(this.oauth);
        console.log(this.credentials);
        await this.connection.login(
          this.credentials.username,
          this.credentials.password,
        );
        return this.connection;
      } catch (err) {
        node.error(err);
        console.log(err);
      }
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

  // receive "test connection' button click from editor"
  RED.httpAdmin.post('/test-salesforce-connection', async function (req, res) {
    const {
      id,
      username,
      password,
      instance_url,
      connected_app_client_id,
      connected_app_client_secret,
    } = req.body;

    console.log(id);

    try {
      let connection = new jsforce.Connection({
        oauth2: {
          loginUrl: instance_url,
          clientId: connected_app_client_id,
          clientSecret: connected_app_client_secret,
        },
      });

      await connection.login(username, password);
      RED.log.info('Salesforce connection successful!');
      res
        .status(200)
        .json({ status: 'success', message: 'Connection successful' });
    } catch (err) {
      RED.log.warn('Salesforce connection failed: ' + err.message);
      res.status(500).json({ status: 'error', message: err.message });
    }
  });
}
