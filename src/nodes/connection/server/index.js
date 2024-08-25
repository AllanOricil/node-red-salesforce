import { Node } from '@allanoricil/node-red-node';
import jsforce from 'jsforce';

export default class Connection extends Node {
  constructor(config) {
    super(config);
    this.loginUrl = config?.instance_url || 'https://login.salesforce.com';
    this.connection = null; // Connection stored here
  }

  static init(RED) {
    // receive "test connection' button click from editor in UI"
    RED.httpAdmin.post(
      '/salesforce/connection/test',
      async function (req, res) {
        try {
          const salesforceConnectionNode = RED.nodes.getNode(req.body.id);
          //! Needs refactoring? This below doesn't allow changing loginURL and validating the changed values?
          //! beter to pass complete field object to the main function?
          if (
            salesforceConnectionNode?.loginUrl &&
            salesforceConnectionNode?.credentials?.connected_app_client_id &&
            salesforceConnectionNode?.credentials?.connected_app_client_secret
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
          return res
            .status(500)
            .json({ status: 'error', message: err.message });
        }

        RED.log.info('Salesforce connection successful!');
        res
          .status(200)
          .json({ status: 'success', message: 'Connection successful' });
      },
    );
  }

  static credentials() {
    return {
      username: { type: 'text', required: true },
      password: { type: 'password', required: true },
      connected_app_client_id: { type: 'password', required: true },
      connected_app_client_secret: { type: 'password', required: true },
    };
  }

  async #createConnection() {
    try {
      const connection = new jsforce.Connection({
        oauth2: {
          loginUrl: this.loginUrl,
          clientId: this.credentials.connected_app_client_id,
          clientSecret: this.credentials.connected_app_client_secret,
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
