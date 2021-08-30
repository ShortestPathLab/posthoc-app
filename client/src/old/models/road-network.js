import config from '../config';
import Store from '../services/store';
import nodeResize from '../utils/node-resize';

/** Class representing a road network */
class RoadNetwork {
  /**
  * Create a grid
  * @param {object} files - RoadNetwork files(co and gr) uploaded by the user
  */
  constructor({coFile, grFile}) {
    /**
    * _id is unique id of the road network that is set to 0.
    * @type  {number}
    * @private
    */
    this._id = 0;
    /**
    * coFile is file of the coordinates that is set from the param.
    * @type  {object}
    * @public
    */
    this.coFile = coFile;
    /**
    * grFile is file of the graph that is set from the param.
    * @type  {object}
    * @public
    */
    this.grFile = grFile;
    this.setupMap();
  }

  setupMap(){
    nodeResize('roadnetwork');
    this.roadCoordinates = Store.createRecord("RoadCo", {roadNetwork: this, file: this.coFile});
    this.roadGraph = Store.createRecord("RoadGr", {roadNetwork: this, file: this.grFile});
  }

}

export default RoadNetwork;
