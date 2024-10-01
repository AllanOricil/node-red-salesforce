import axios from 'axios';

function setConnectionResult(message, color) {
  const testConnectionResult = document.querySelector(
    '#connection #test-connection-result',
  );
  testConnectionResult.textContent = message;
  testConnectionResult.style.color = color;
}

export function test(nodeId) {
  console.log(
    `Button clicked - Test Salesforce connection for node Id: ${nodeId}`,
  );
  var params = {
    id: nodeId,
    username: document.getElementById('node-config-input-username').value,
    password: document.getElementById('node-config-input-password').value,
    instanceUrl: document.getElementById('node-config-input-instanceUrl').value,
    connectedAppClientId: document.getElementById(
      'node-config-input-connectedAppClientId',
    ).value,
    connectedAppClientSecret: document.getElementById(
      'node-config-input-connectedAppClientSecret',
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
