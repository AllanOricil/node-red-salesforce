import { Node } from '@allanoricil/nrg-nodes';
import { isValidSalesforceId } from '../../../utils/utils';

export default class Crud extends Node {
  constructor(config) {
    super(config);
    this.salesforceConnectionNode = Crud.RED.nodes.getNode(config.connection);
  }

  async onInput(msg, send, done) {
    if (!this.salesforceConnectionNode) {
      this.error('No connection node configured.', msg);
      done();
      return;
    }
    let connection = await this.salesforceConnectionNode.getConnection();

    if (!connection) {
      this.error('Failed to establish a connection to Salesforce', msg);
      done();
      return;
    }
    let msgInputType = 'unknown';
    let id;
    let idArray;
    if (Array.isArray(msg.payload)) {
      let allStrings = msg.payload.every((item) => typeof item === 'string');
      let allObjects = msg.payload.every(
        (item) =>
          typeof item === 'object' && item !== null && !Array.isArray(item),
      );
      if (allStrings) {
        msgInputType = 'arrayOfStrings';
        idArray = msg.payload.filter(isValidSalesforceId);
      } else if (allObjects) {
        msgInputType = 'arrayOfObjects';
        idArray = msg.payload.reduce((result, item) => {
          let extractedId = item.Id || item.id || item.ID;
          if (extractedId && isValidSalesforceId(extractedId)) {
            result.push(extractedId);
          }
          return result;
        }, []);
      }
    } else if (typeof msg.payload === 'object' && msg.payload !== null) {
      msgInputType = 'object';
      let extractedId = msg.payload.Id || msg.payload.id || msg.payload.ID;
      id = extractedId && isValidSalesforceId(extractedId) ? extractedId : null;
    } else if (typeof msg.payload === 'string') {
      msgInputType = 'string';
      id = isValidSalesforceId(msg.payload) ? msg.payload : null;
      console.log(id);
    }
    if (msgInputType == 'unkown') {
      this.error(
        'Message input is not an ID, RecordObject, Array of IDs or Array of records. Or not expected format',
      );
    }
    msg.crudOperation = this.config.operation;
    let options = {
      allOrNone: this.config.allOrNone,
      allowRecursive: this.config.allowRecursive,
    };

    if (this.config.operation == 'create') {
      try {
        let result;
        if (msgInputType == 'arrayOfObjects') {
          result = await connection
            .sobject(this.config.sObject)
            .create(msg.payload, options);
        } else if (msgInputType == 'object') {
          result = await connection
            .sobject(this.config.sObject)
            .create(msg.payload);
        }
        msg.payload = result || 'No valid record to create ';
        send(msg);
      } catch (error) {
        this.error('Error CRUD Create operation: ' + error.message, msg);
        done();
      }
    }

    if (this.config.operation == 'read') {
      try {
        let result;
        if (
          (msgInputType == 'arrayOfStrings' ||
            msgInputType == 'arrayOfObjects') &&
          idArray != null
        ) {
          let resultRaw = await connection
            .sobject(this.config.sObject)
            .retrieve(idArray);
          result = resultRaw.filter((value) => value != null);
        } else if (
          (msgInputType == 'string' || msgInputType == 'object') &&
          id != null
        ) {
          result = await connection.sobject(this.config.sObject).retrieve(id);
        }
        msg.payload = result || 'No valid IDs to retrieve';
        send(msg);
      } catch (error) {
        this.error('Error CRUD Read operation: ' + error.message, msg);
        done();
      }
    }

    if (this.config.operation == 'update') {
      try {
        let result;
        if (msgInputType == 'arrayOfObjects' || msgInputType == 'object') {
          result = await connection
            .sobject(this.config.sObject)
            .update(msg.payload, options);
        }
        msg.payload = result || 'No valid record to update ';
        send(msg);
      } catch (error) {
        this.error('Error CRUD Update operation: ' + error.message, msg);
        done();
      }
    }

    if (this.config.operation == 'upsert') {
      try {
        let result;
        if (msgInputType == 'object' || msgInputType == 'arrayOfObjects') {
          result = await connection
            .sobject(this.config.sObject)
            .upsert(msg.payload, this.config.upsertExtIdField, options);
        }
        msg.payload = result || 'No valid record to upsert ';
        send(msg);
      } catch (error) {
        this.error('Error CRUD Upsert operation: ' + error.message, msg);
        done();
      }
    }

    if (this.config.operation == 'delete') {
      try {
        let result;
        if (
          (msgInputType == 'arrayOfStrings' ||
            msgInputType == 'arrayOfObjects') &&
          idArray != null
        ) {
          let resultRaw = await connection
            .sobject(this.config.sObject)
            .delete(idArray, options);
          result = resultRaw.filter((value) => value != null);
        } else if (
          (msgInputType == 'string' || msgInputType == 'object') &&
          id != null
        ) {
          result = await connection.sobject(this.config.sObject).delete(id);
        }
        msg.payload = result || 'No valid IDs for records to delete';
        send(msg);
      } catch (error) {
        this.error('Error CRUD Delete operation: ' + error.message, msg);
        done();
      }
    }
    done();
  }
}
