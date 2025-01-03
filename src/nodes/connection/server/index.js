import { Node } from '@allanoricil/nrg-nodes';
import jsforce from 'jsforce';

export default class Connection extends Node {
  constructor(config) {
    super(config);
    this.loginUrl = config?.instanceUrl || 'https://login.salesforce.com';
    this.connection = null;
  }

  static init() {
    this.RED.httpAdmin.post('/salesforce/connection/test', async (req, res) => {
      try {
        const salesforceConnectionNode = this.RED.nodes.getNode(req.body.id);
        if (
          salesforceConnectionNode?.loginUrl &&
          salesforceConnectionNode?.credentials?.connectedAppClientId &&
          salesforceConnectionNode?.credentials?.connectedAppClientSecret
        ) {
          this.RED.log.info(
            `using deployed salesforce connection node: ${salesforceConnectionNode.name || salesforceConnectionNode.id}`,
          );
          await salesforceConnectionNode.getConnection();
        } else {
          // TODO: add ajv to validate req body
          const connection = new jsforce.Connection({
            oauth2: {
              loginUrl: req.body.instanceUrl,
              clientId: req.body.connectedAppClientId,
              clientSecret: req.body.connectedAppClientSecret,
            },
          });

          await connection.login(req.body.username, req.body.password);
        }
      } catch (err) {
        this.RED.log.error('Salesforce connection failed: ' + err.message);
        return res.status(500).json({ status: 'error', message: err.message });
      }

      this.RED.log.info('Salesforce connection successful!');
      res
        .status(200)
        .json({ status: 'success', message: 'Connection successful' });
    });
  }

  static credentials() {
    return {
      username: { type: 'text', required: true },
      password: { type: 'password', required: true },
      connectedAppClientId: { type: 'password', required: true },
      connectedAppClientSecret: { type: 'password', required: true },
    };
  }

  async #createConnection() {
    try {
      const connection = new jsforce.Connection({
        oauth2: {
          loginUrl: this.loginUrl,
          clientId: this.credentials.connectedAppClientId,
          clientSecret: this.credentials.connectedAppClientSecret,
        },
      });
      await connection.login(
        this.credentials.username,
        this.credentials.password,
      );

      this.log('accessToken:' + connection.accessToken);
      this.log('refreshToken:' + connection.refreshToken);
      this.log('instanceUrl:' + connection.instanceUrl);
      this.log('userId:' + connection.userInfo.id);
      this.log('orgId:' + connection.userInfo.organizationId);

      return connection;
    } catch (err) {
      this.error(`Error while creating new connection: ${err.message}`);
    }
  }

  // TODO: pass several parameters to this guy to determine the type of connection it can open
  async getConnection() {
    if (this.connection) {
      this.log('returning cached connection');
      return this.connection;
    }

    this.log('creating new connection');
    this.connection = await this.#createConnection();

    return this.connection;
  }
}
