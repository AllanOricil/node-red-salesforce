module.exports = function (RED) {
  'use strict';
  var jsforce = require('jsforce');
  var { isValidSalesforceId } = require('./utils/utils');



  function SalesforceCRUDNode(config) {
    RED.nodes.createNode(this, config);
    const salesforceConnectionNode = RED.nodes.getNode(config.connection);
    var node = this; // referencing the current node 

    this.on('input', async function(msg, send, done) {
      if (!salesforceConnectionNode) {
        node.error("No connection node configured.", msg);
        done(); // Ensure done is called to signal completion
        return; // Exit the function early
      }
        let connection = await salesforceConnectionNode.getConnection();

        if (!connection) {
          node.error("Failed to establish a connection to Salesforce", msg);
          done(); // Ensure done is called to signal completion
          return; // Exit the function early
        }
        // Resolve input message as single record or array and prep for processing (single id OR array with id's)
        let msgInputType = 'unknown'; // Default 'unkown' means no valid ID's found as entry
        let id; // extracted single ID
        let idArray;  // extraced arrays of IDs
        if (Array.isArray(msg.payload)) {
            let allStrings = msg.payload.every(item => typeof item === 'string');
            let allObjects = msg.payload.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));     
            if (allStrings) {
                msgInputType = 'arrayOfStrings';
                idArray = msg.payload.filter(isValidSalesforceId); 
            }else if (allObjects) {
                msgInputType = 'arrayOfObjects';
                idArray = msg.payload.reduce((result, item) => { // Extract Ids from record objects and validate Ids
                  if (item.Id && isValidSalesforceId(item.Id)) {
                      result.push(item.Id);
                  }
                  return result;
                }, []);
            }
        }
        else if (typeof msg.payload === 'object' && msg.payload !== null) {
            msgInputType = 'object';
            let extractedId = msg.payload.Id || msg.payload.id
            id =  extractedId && isValidSalesforceId(extractedId)?  extractedId : null; 
        }
        else if (typeof msg.payload === 'string') {
            msgInputType = 'string';
            id = isValidSalesforceId(msg.payload)? msg.payload : null; 
            console.log(id);
        }
        if(msgInputType == 'unkown'){
          node.error('Message input is not an ID, RecordObject, Array of IDs or Array of records. Or not expected format');
        }
        

      // ***** Create ******
      if (config.operation == 'create' ){
        try{
          let result; 
          if(msgInputType == 'arrayOfObjects') { // array with records
            const create = await connection.sobject(config.sObject).create(msg.payload);
            result = create
          }else if (msgInputType == 'object' ) { // single record
            const create = await connection.sobject(config.sObject).create(msg.payload);
            result = create
          }
          msg.payload = result || 'No valid record to create '; 
        }catch (error) {
          node.error("Error CRUD Create operation: " + error.message, msg);
          done();
          }
        };
      // ***** Read ******
        if (config.operation == 'read' ){
        try{
          let result; 
          if((msgInputType == 'arrayOfStrings' || msgInputType == 'arrayOfObjects') && idArray != null) { // array with ids
            let resultRaw = await connection.sobject(config.sObject).retrieve(idArray)
            result = resultRaw.filter(value => value != null) // remove null values in array (when ID not matching inserted sObject)
          }else if ((msgInputType == 'string' || msgInputType == 'object') && id != null) { // single id in string
            result = await connection.sobject(config.sObject).retrieve(id)
          }
          msg.payload = result || 'No valid IDs to retrieve'; 
        }catch (error) {
          node.error("Error CRUD Read operation: " + error.message, msg);
          done();
          }
        };
      //! Need UPSERT inside of Update or seperate? 
      // ***** Update ******https://jsforce.github.io/document/#update
      if (config.operation == 'update' ){
        try{
          if(msgInputType == 'object'){
            const ret = await conn.sobject("Account").update({
              Id: '0010500000fxbcuAAA',
              Name : 'Updated Account #1'
            })
            if (ret.success) {
              console.log(`Updated Successfully : ${ret.id}`);
            }
          }
        }catch (error) {
          node.error("Error retrieving record CRUD Update operation: " + error.message, msg);
          done();
          }
        };
      // ***** Delete ****** https://jsforce.github.io/document/#delete
      if (config.operation == 'delete' ){
        try{
          const account = await conn.sobject(config.sobject).retrieve('0010500000fxR4EAAU')
          console.log(`Name: ${account.Name}`)
        }catch (error) {
          node.error("Error retrieving record CRUD Delete operation: " + error.message, msg);
          done();
          }
        };

      // Finally 
      node.send(msg);
      done(); // Ensure done is always called to signal the end of processing
        }); 

  }


  RED.nodes.registerType('CRUD', SalesforceCRUDNode);
};
