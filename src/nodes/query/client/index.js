export default {
  category: 'Salesforce',
  color: '#FFFFFF',
  defaults: {
    connection: { type: 'connection', required: true },
    query: { value: 'Select Id From Account LIMIT 1' },
    outputStyle: { value: 'messageAllRecords', required: true }, // Default to 'allRecords'
    endMessage: { value: 'none', required: true }, // Default to "none"
    outputs: { value: 1 }, // Default output count 1, when message per record and "inNodeOutput" create additional output
    maxFetch: { value: 10000 }, // max records to fetch
    delay: { value: 10 }, // delay in milliseconds between releasing records
  },
  inputs: 1,
  outputs: 1, // gets updated dynamically when 'endMessage inNodeOutput'
  outputLabels: ['Record Output', 'End Message Output'],

  icon: 'salesforce.png',
  label: 'Query',
  oneditprepare: function () {
    // Editor
    this.editor = RED.editor.createEditor({
      id: 'node-input-query_editor',
      mode: 'ace/mode/sql',
      value: this.query,
    });
    // Set maxFetch from the node's current configuration
    $('#node-input-maxFetch').val(this.maxFetch || 10000);
    $('#node-input-delay').val(this.delay || 10);
    // Function to toggle the visibility of the end message select based on the output style
    function toggleEndMessageVisibilityAndOutput() {
      var outputStyle = $('#node-input-outputStyle').val();
      var endMessage = $('#node-input-endMessage').val();
      // toggle endmessage field when messagePerRecord
      $('#endMessageComponent').toggle(outputStyle === 'messagePerRecord');
      // update Node output value
      $('#node-input-outputs').val(
        outputStyle === 'messagePerRecord' && endMessage === 'inNodeOutput'
          ? 2
          : 1,
      );
    }
    // Set initial visibility state of the end message options
    toggleEndMessageVisibilityAndOutput();

    // Attach change event to the outputStyle and Endmessage  dropdown to control the visibility and output dynamically
    $('#node-input-outputStyle, #node-input-endMessage').on(
      'change',
      function () {
        toggleEndMessageVisibilityAndOutput();
      },
    );
  },
  oneditsave: function () {
    this.query = this.editor.getValue();
    this.maxFetch = $('#node-input-maxFetch').val();
    this.delay = $('#node-input-delay').val();
    this.editor.destroy();
    delete this.editor;
  },
  oneditcancel: function () {
    this.editor.destroy();
    delete this.editor;
  },
};
