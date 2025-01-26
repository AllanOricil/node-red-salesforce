import { Node } from '@allanoricil/nrg-nodes';
import jsforce from 'jsforce';

export default class Connection extends Node {
  #connection;

  constructor(config) {
    super(config);
    this.loginUrl = config?.instanceUrl || 'https://login.salesforce.com';
    this.#connection = null;
  }

  static init() {
    this.RED.httpAdmin.post(
      '/api/v1/salesforce/connection/test',
      async (req, res) => {
        try {
          const salesforceConnectionNode = this.RED.nodes.getNode(
            req.body.nodeId,
          );
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
            // TODO: validate req body before calling this
            await Connection.#createConnection(
              req.body.instanceUrl,
              req.body.connectedAppClientId,
              req.body.connectedAppClientSecret,
              req.body.username,
              req.body.password,
            );
          }
        } catch (err) {
          this.RED.log.error('salesforce connection failed: ' + err.message);
          // TODO: add error_code so that the client can handle it
          return res.status(500).json({ message: 'connection failed' });
        }

        this.RED.log.info('salesforce connection created');
        res.status(200).json({ message: 'connection succeeded' });
      },
    );
  }

  static credentials() {
    return {
      username: { type: 'text', required: true },
      password: { type: 'password', required: true },
      connectedAppClientId: { type: 'password', required: true },
      connectedAppClientSecret: { type: 'password', required: true },
    };
  }

  static async #createConnection(
    loginUrl,
    clientId,
    clientSecret,
    username,
    password,
  ) {
    try {
      const connection = new jsforce.Connection({
        oauth2: {
          loginUrl,
          clientId,
          clientSecret,
        },
      });
      await connection.login(clientSecret, password);

      this.debug('accessToken:' + connection.accessToken);
      this.debug('refreshToken:' + connection.refreshToken);
      this.debug('instanceUrl:' + connection.instanceUrl);
      this.debug('userId:' + connection.userInfo.id);
      this.debug('orgId:' + connection.userInfo.organizationId);

      return connection;
    } catch (err) {
      this.error(`error while creating new connection: ${err.message}`);
      throw err;
    }
  }

  async getConnection() {
    if (this.#connection) {
      this.log('returning cached connection');
      return this.#connection;
    }

    this.log('creating new connection');
    this.#connection = await Connection.#createConnection(
      this.loginUrl,
      this.credentials.connectedAppClientId,
      this.credentials.connectedAppClientSecret,
      this.credentials.username,
      this.credentials.password,
    );

    return this.#connection;
  }
}
