import models from '../models';

let getModel = function(modelName) {
    let referredModel;
    models().forEach((model) => {
        if (model.name == modelName) {
            referredModel = model;
            return;
        }
    });
    if (referredModel) {
        return referredModel;
    } else {
        //throw error saying wrong model name passed
    }
}

let instance = null;

/** @module services/store
* this is data store implementation. Store is a singleton class. the values are stored in data. and it has common functions like createRecord, findAll, findBy, find, getRecord, relationships(hasMany, belongsTo)
*/
class StoreSingleton {
    constructor() {
        if (!instance) {
            instance = this;
            this.data = {};
        }
        return instance;
    }

    createRecord(modelName, attributes) {
        this.data[modelName] = this.data[modelName] || [];
        let model = getModel(modelName);
        let record = new model(attributes);
        // this.data[modelName][record._id] = record;
        this.data[modelName].push(record); // using array instead of object
        return record;
    }

    find(modelName){
      try{
        return this.data[modelName][0];
      }
      catch(e){
        return null;
      }
    }

    findById(modelName, id){
      try{
        return this.data[modelName][id];
      }
      catch(e){
        return null;
      }
    }

    all(modelName){
      return Object.values(this.data[modelName]);
    }

    where(modelName, condition){
      return Object.values(this.data[modelName]).filter(record => Object.keys(condition).every(key => record[key] == condition[key]));
    }

    findBy(modelName, condition){
      return this.where(modelName, condition)[0];
    }

    count(modelName){
      return this.data[modelName].length;
    }

    clearData() {
      this.data = {};
    }
}
let Store = new StoreSingleton();
window.store = Store;
export default Store;
