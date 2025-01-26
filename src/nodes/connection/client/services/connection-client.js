import { createAxiosInstance } from './axios';

export default class ConnectionClient {
  #client;

  constructor() {
    this.#client = createAxiosInstance('/api/v1/salesforce', {
      'Content-Type': 'application/json',
    });
  }

  async testConnection(
    nodeId,
    username,
    password,
    instanceUrl,
    connectedAppClientId,
    connectedAppClientSecret,
  ) {
    try {
      const response = await this.#client.post('/connection/test', {
        nodeId,
        username,
        password,
        instanceUrl,
        connectedAppClientId,
        connectedAppClientSecret,
      });

      return response.data;
    } catch (error) {
      console.error('something went wrong');
      throw error;
    }
  }
}
