import { onClick } from './handlers';

export default {
  category: 'config',
  defaults: {
    name: { value: '', required: false },
    instanceUrl: { value: 'https://login.salesforce.com', required: true },
    apiVersion: { value: '60.0', required: true },
  },
  credentials: {
    username: { type: 'text', required: true },
    password: { type: 'password', required: true },
    connectedAppClientId: { type: 'password', required: true },
    connectedAppClientSecret: { type: 'password', required: true },
  },
  exportable: false,
  label: function () {
    return this.name || this.instanceUrl || this._('connection.label');
  },
  // TODO: find a way to generate the form of the node based on a vue 3 component
  oneditprepare: function () {
    const testConnectionButton = document.getElementById(
      'test-connection-button',
    );
    testConnectionButton.onclick = onClick.bind(this);
  },
};
