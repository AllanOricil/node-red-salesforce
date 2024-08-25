export default {
  category: 'Salesforce',
  color: '#FFFFFF',
  defaults: {
    node_name: { value: 'CRUD - create' },
    connection: { value: '', type: 'connection' },
    operation: { value: 'create' },
    sObject: { value: 'Account' },
    allOrNone: { value: false },
    allowRecursive: { value: true },
    upsertExtIdField: { value: null },
  },
  inputs: 1,
  outputs: 1,
  icon: 'salesforce.png',
  label: function () {
    return this.node_name;
  },
  oneditprepare: function () {
    // Logic to handle automatic node label updates, set to operation, only if it is standard syntax.
    // If user defined a label (not matching standard syntax) don't update label name
    const predefinedLabels = [
      'CRUD - create',
      'CRUD - read',
      'CRUD - update',
      'CRUD - delete',
      'CRUD - upsert',
    ];
    // Set editor values to current values when opening
    $('#node-input-node_name').val(this.node_name);
    $('#node-input-allOrNone').val(this.allOrNone);
    $('#node-input-allowRecursive').val(this.allowRecursive);
    $('#node-input-upsertExtIdField').val(this.upsertExtIdField);
    $('#node-input-operation').on('change', function () {
      let operation = $(this).val();
      let currentName = $('#node-input-node_name').val();
      // set node name / label syntax
      if (predefinedLabels.includes(currentName)) {
        $('#node-input-node_name').val(`CRUD - ${operation}`);
      }
      // toggle allOrNone checkbox Visibility
      toggleOptionsVisibility();
    });
    // function to toggle AllOrNone checkbox when operation Delete
    function toggleOptionsVisibility() {
      let operation = $('#node-input-operation').val();
      $('#form-row-allOrNone').toggle(
        ['create', 'update', 'upsert', 'delete'].includes(operation),
      );
      $('#form-row-allowRecursive').toggle(
        ['create', 'update', 'upsert', 'delete'].includes(operation),
      );
      $('#form-row-upsertExtIdField').toggle(['upsert'].includes(operation));
    }
    // Run initial visibility state allOrNone checkbox
    toggleOptionsVisibility();
  },
  oneditsave: function () {
    this.operation = $('#node-input-operation').val();
    this.sObject = $('#node-input-sObject').val();
    this.node_name = $('#node-input-node_name').val();
    this.allOrNone = $('#node-input-allOrNone').val();
    this.allowRecursive = $('#node-input-allowRecursive').val();
    this.upsertExtIdField = $('#node-input-upsertExtIdField').val();
  },
  oneditcancel: function () {},
};
