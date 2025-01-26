import ConnectionClient from '@nodes/connection/client/services/connection-client';
import { setConnectionResult } from './helper';

async function onClick() {
  const nodeId = this.id;
  console.log(
    `Button clicked - Test Salesforce connection for node Id: ${nodeId}`,
  );

  // TODO: validate inputs in the client
  const username = document.getElementById('node-config-input-username').value;
  const password = document.getElementById('node-config-input-password').value;
  const instanceUrl = document.getElementById(
    'node-config-input-instanceUrl',
  ).value;
  const connectedAppClientId = document.getElementById(
    'node-config-input-connectedAppClientId',
  ).value;
  const connectedAppClientSecret = document.getElementById(
    'node-config-input-connectedAppClientSecret',
  ).value;

  try {
    const connectionClient = new ConnectionClient();
    await connectionClient.testConnection(
      nodeId,
      username,
      password,
      instanceUrl,
      connectedAppClientId,
      connectedAppClientSecret,
    );

    setConnectionResult(
      this._('connection.messages.successfulConnection'),
      'green',
    );
  } catch (error) {
    console.error(
      'Error:',
      error.response ? error.response.status : error.message,
      error,
    );

    // TODO: add different error messages based on error code
    setConnectionResult(this._('connection.messages.failedConnection'), 'red');
  }
}

export { onClick };
