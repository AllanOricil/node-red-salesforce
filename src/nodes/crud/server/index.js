import { Node } from '@allanoricil/node-red-node';
import { isValidSalesforceId } from '../../../utils/utils';

export default class Crud extends Node {
  constructor(config) {
    super(config);
    this.salesforceConnectionNode = Crud.RED.nodes.getNode(config.connection);
  }

  async onInput(msg, send, done) {
    if (!this.salesforceConnectionNode) {
      this.error('No connection node configured.', msg);
      done(); // Ensure done is called to signal completion
      return; // Exit the function early
    }
    let connection = await this.salesforceConnectionNode.getConnection();

    if (!connection) {
      this.error('Failed to establish a connection to Salesforce', msg);
      done(); // Ensure done is called to signal completion
      return; // Exit the function early
    }
    // Resolve input message as single record or array and prep for processing (single id OR array with id's)
    let msgInputType = 'unknown'; // Default 'unkown' means no valid ID's found as entry
    let id; // extracted single ID
    let idArray; // extraced arrays of IDs
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
          // Extract Ids from record objects and validate Ids
          let extractedId = item.Id || item.id || item.ID;
          if (extractedId && isValidSalesforceId(extractedId)) {
            result.push(extractedId);
          }
          return result;
        }, []);
      }
    } else if (typeof msg.payload === 'object' && msg.payload !== null) {
      msgInputType = 'object';
      let extractedId = msg.payload.Id || msg.payload.id || msg.payload.ID; // search for id key in object
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
    // set operation type in msg object for downstream use
    msg.crud_operation = this.config.operation;
    let options = {
      allOrNone: this.config.allOrNone,
      allowRecursive: this.config.allowRecursive,
    };

    // ***** Create ******
    if (this.config.operation == 'create') {
      try {
        let result;
        if (msgInputType == 'arrayOfObjects') {
          // array with records
          result = await connection
            .sobject(this.config.sObject)
            .create(msg.payload, options);
        } else if (msgInputType == 'object') {
          // single record
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
    // ***** Read ******
    if (this.config.operation == 'read') {
      try {
        let result;
        if (
          (msgInputType == 'arrayOfStrings' ||
            msgInputType == 'arrayOfObjects') &&
          idArray != null
        ) {
          // array with ids
          let resultRaw = await connection
            .sobject(this.config.sObject)
            .retrieve(idArray);
          result = resultRaw.filter((value) => value != null); // remove null values in array (when ID not matching inserted sObject)
        } else if (
          (msgInputType == 'string' || msgInputType == 'object') &&
          id != null
        ) {
          // single id in string
          result = await connection.sobject(this.config.sObject).retrieve(id);
        }
        msg.payload = result || 'No valid IDs to retrieve';
        send(msg);
      } catch (error) {
        this.error('Error CRUD Read operation: ' + error.message, msg);
        done();
      }
    }
    // ***** Update ****** https://jsforce.github.io/document/#update
    //! when 'no valid records to update' << Throw error? some for other operations?
    if (this.config.operation == 'update') {
      try {
        let result;
        if (msgInputType == 'arrayOfObjects' || msgInputType == 'object') {
          // array with records
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
    // ***** Upsert ****** https://jsforce.github.io/document/#upsert
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
    // ***** Delete ****** https://jsforce.github.io/document/#delete
    if (this.config.operation == 'delete') {
      try {
        let result;
        if (
          (msgInputType == 'arrayOfStrings' ||
            msgInputType == 'arrayOfObjects') &&
          idArray != null
        ) {
          // array with ids
          let resultRaw = await connection
            .sobject(this.config.sObject)
            .delete(idArray, options);
          result = resultRaw.filter((value) => value != null); // remove null values in array (when ID not matching inserted sObject)
        } else if (
          (msgInputType == 'string' || msgInputType == 'object') &&
          id != null
        ) {
          // single id in string
          result = await connection.sobject(this.config.sObject).delete(id);
        }
        msg.payload = result || 'No valid IDs for records to delete';
        send(msg);
      } catch (error) {
        this.error('Error CRUD Delete operation: ' + error.message, msg);
        done();
      }
    }

    // Finally
    done(); // Ensure done is always called to signal the end of processing
  }
}
