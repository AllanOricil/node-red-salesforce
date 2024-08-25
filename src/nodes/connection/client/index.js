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
    // Store the node ID in a variable for use in the testConnection function
    var nodeId = this.id;
    const testresult = document.getElementById('testresult');

    window.testConnection = function () {
      console.log(
        `Button clicked - Test Salesforce connection for node Id: ${nodeId}`,
      );
      var params = {
        id: nodeId,
        username: document.getElementById('node-config-input-username').value,
        password: document.getElementById('node-config-input-password').value,
        instance_url: document.getElementById('node-config-input-instance_url')
          .value,
        connected_app_client_id: document.getElementById(
          'node-config-input-connected_app_client_id',
        ).value,
        connected_app_client_secret: document.getElementById(
          'node-config-input-connected_app_client_secret',
        ).value,
      };
      console.log(params);
      $.ajax({
        url: '/salesforce/connection/test',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(params),
        success: function (res) {
          console.log('Response:', res);
          testresult.textContent = 'CONNECTION OK';
          testresult.style.color = 'green';
        },
        error: function (xhr, status, error) {
          console.log(error);
          console.error('Error:', status, error);
          testresult.textContent = `CONNECTION FAILED: ${error}`;
          testresult.style.color = 'red';
        },
      });
    };
  },
};
