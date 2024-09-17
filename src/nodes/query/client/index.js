export default {
  category: 'Salesforce',
  color: '#FFFFFF',
  defaults: {
    name: { value: '', required: false },
    connection: { type: 'connection', required: true },
    query: { value: 'Select Id From Account LIMIT 1' },
    outputStyle: { value: 'messageAllRecords', required: true },
    endMessage: { value: 'none', required: true },
    outputs: { value: 1 },
    maxFetch: { value: 10000 },
    delay: { value: 10 },
  },
  inputs: 1,
  outputs: 1,
  outputLabels: ['Record Output', 'End Message Output'],
  icon: 'salesforce.png',
  label: function () {
    return this.name || this._('query.label');
  },
  oneditprepare: function () {
    this.editor = RED.editor.createEditor({
      id: 'node-input-queryEditor',
      mode: 'ace/mode/sql',
      value: this.query,
    });
    $('#node-input-maxFetch').val(this.maxFetch || 10000);
    $('#node-input-delay').val(this.delay || 10);
    function toggleEndMessageVisibilityAndOutput() {
      var outputStyle = $('#node-input-outputStyle').val();
      var endMessage = $('#node-input-endMessage').val();
      $('#endMessageComponent').toggle(outputStyle === 'messagePerRecord');
      $('#node-input-outputs').val(
        outputStyle === 'messagePerRecord' && endMessage === 'inNodeOutput'
          ? 2
          : 1,
      );
    }
    toggleEndMessageVisibilityAndOutput();
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
