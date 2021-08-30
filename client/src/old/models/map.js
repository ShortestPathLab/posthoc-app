/** Class representing a map for the algorithm */
class Map {
  /**
  * Create a map for the search algorithm
  * @param {object} mapType - grid/mesh
  */
  constructor(options) {
    /**
    * _id is unique id of the grid that is set to 0.
    * @type  {number}
    * @private
    */
    this._id = 0;

    /**
    * mapType is type of map
    * @type {string}
    * @public
    */
    this.mapType = options.fileType;

    /**
    * mapName is name of map
    * @type {string}
    * @public
    */
    this.mapName = options.fileName;
  }
}

export default Map;
