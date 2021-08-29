import config from '../config';
import RoadNetworkService from '../services/road-network';

/** Class representing a road graph */
class RoadGr {
  /**
  * Create roadGraph
  * @param {object} file - roadGraph file uploaded by the user
  */
  constructor({roadNetwork, file}) {
    /**
    * _id is unique id of the road graph that is set to 0.
    * @type  {number}
    * @private
    */
    this._id = 0;
    /**
    * roadNetwork is roadNetwork map.
    * @type  {object}
    * @public
    */
    this.roadNetwork = roadNetwork;
    /**
    * file is file of the road graph that is set from the param.
    * @type  {object}
    * @public
    */
    this.file = file;
    /**
    * _grData is cache and promise object that resolves to data contained in gr file.
    * @type {Promise}
    * @private
    */
    this._grData = null;
  }

  /**
  * grData returns _grData if it is resolved. Else, sets it.
  * @type {object}
  * @public
  */
  get grData(){
    if(!this._grData){
      let that = this;
      this._grData = new Promise((resolve, reject) => {
        try{
          RoadNetworkService.parser.grParse(that.file, (data) => {
            resolve(data);
          });
        }
        catch(e){
          reject(e);
        }
      });
    }
    return this._grData;
  }
}

export default RoadGr;
