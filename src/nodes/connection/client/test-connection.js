import axios from 'axios';

function setConnectionResult(message, color) {
  const testConnectionResult = document.getElementById('testresult');
  testConnectionResult.textContent = message;
  testConnectionResult.style.color = color;
}

export function testConnection(nodeId) {
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
  console.table(params);
  axios
    .post('/salesforce/connection/test', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(function (res) {
      console.log('Response:', res);
      setConnectionResult('CONNECTION OK', 'green');
    })
    .catch(function (error) {
      console.error(
        'Error:',
        error.response ? error.response.status : error.message,
        error,
      );
      setConnectionResult(`CONNECTION FAILED: ${error.message}`, 'red');
    });
}
