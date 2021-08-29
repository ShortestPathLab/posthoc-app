import config from '../config';
import RoadNetworkService from '../services/road-network';

/** Class representing a road coordinates */
class RoadCo {
  /**
  * Create roadCoordinates
  * @param {object} file - roadCoordinates file uploaded by the user
  */
  constructor({roadNetwork, file}) {
    /**
    * _id is unique id of the road coordinates that is set to 0.
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
    * file is file of the coordinates that is set from the param.
    * @type  {object}
    * @public
    */
    this.file = file;
    /**
    * _coData is cache and promise object that resolves to data contained in co file.
    * @type {Promise}
    * @private
    */
    this._coData = null;
  }

  /**
  * coData returns _coData if it is resolved. Else, sets it.
  * @type {object}
  * @public
  */
  get coData(){
    if(!this._coData){
      let that = this;
      this._coData = new Promise((resolve, reject) => {
        try{
          RoadNetworkService.parser.coParse(that.file, (data) => {
            that.roadNetwork.maxX = data.maxX;
            that.roadNetwork.maxY = data.maxY;
            that.roadNetwork.minX = data.minX;
            that.roadNetwork.minY = data.minY;
            that.roadNetwork.width = data.maxX * config.roadNetworkScale;
            that.roadNetwork.height = data.maxY * config.roadNetworkScale;
            resolve(data);
          });
        }
        catch(e){
          reject(e);
        }
      });
    }
    return this._coData;
  }

}

export default RoadCo;
