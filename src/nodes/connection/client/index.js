import { testConnection } from './test-connection';

export default {
  category: 'config',
  defaults: {
    name: { value: '', required: false },
    instance_url: { value: 'https://login.salesforce.com', required: true },
    api_version: { value: '60.0', required: true },
  },
  credentials: {
    username: { type: 'text', required: true },
    password: { type: 'password', required: true },
    connected_app_client_id: { type: 'password', required: true },
    connected_app_client_secret: { type: 'password', required: true },
  },
  exportable: false,
  label: function () {
    return this.name || this.instance_url;
  },
  oneditprepare: function () {
    const nodeId = this.id;
    const testConnectionButton = document.getElementById(
      'test-connection-button',
    );
    testConnectionButton.onclick = () => testConnection(nodeId);
  },
};
