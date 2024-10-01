export default {
  category: 'Salesforce',
  color: '#FFFFFF',
  defaults: {
    name: { value: 'CRUD - create' },
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
    return this.name || this._('crud.label');
  },
  oneditprepare: function () {
    const predefinedLabels = [
      'CRUD - create',
      'CRUD - read',
      'CRUD - update',
      'CRUD - delete',
      'CRUD - upsert',
    ];
    $('#node-input-name').val(this.name);
    $('#node-input-allOrNone').val(this.allOrNone);
    $('#node-input-allowRecursive').val(this.allowRecursive);
    $('#node-input-upsertExtIdField').val(this.upsertExtIdField);
    $('#node-input-operation').on('change', function () {
      let operation = $(this).val();
      let currentName = $('#node-input-name').val();
      if (predefinedLabels.includes(currentName)) {
        $('#node-input-name').val(`CRUD - ${operation}`);
      }
      toggleOptionsVisibility();
    });
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
    toggleOptionsVisibility();
  },
  oneditsave: function () {
    this.operation = $('#node-input-operation').val();
    this.sObject = $('#node-input-sObject').val();
    this.name = $('#node-input-name').val();
    this.allOrNone = $('#node-input-allOrNone').val();
    this.allowRecursive = $('#node-input-allowRecursive').val();
    this.upsertExtIdField = $('#node-input-upsertExtIdField').val();
  },
  oneditcancel: function () {},
};
