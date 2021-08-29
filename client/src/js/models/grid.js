import config from '../config';
import GridService from '../services/grid';
import nodeResize from '../utils/node-resize';

/** Class representing a grid map */
class Grid {
  /**
  * Create a grid
  * @param {object} gridFile - Grid file uploaded by the user
  */
  constructor(gridFile) {
    /**
    * _id is unique id of the grid that is set to 0.
    * @type  {number}
    * @private
    */
    this._id = 0;
    /**
    * gridFile is file of the grid that is set from the param.
    * @type  {object}
    * @public
    */
    this.gridFile = gridFile;
    /**
    * _gridData is cache and promise object that resolves to data contained in grid file.
    * @type {Promise}
    * @private
    */
    this._gridData = null;
    /**
    * _cells is cache and promise object that resolves to array of rows which array of cells in
    * each column that has information of position, width, height, color, border.
    * @type {Promise}
    * @private
    */
    this._cells = null;
    /**
    * width is width of the grid
    * @type {number}
    * @public
    */
    this.width = null;
    /**
    * height is height of the grid
    * @type {number}
    * @public
    */
    this.height = null;
  }

  /**
  * gridData returns _gridData if it is resolved. Else, sets it.
  * @type {object}
  * @public
  */
  get gridData(){
    if(!this._gridData){
      let that = this;
      this._gridData = new Promise((resolve, reject) => {
        try{
          GridService.parser.parse(that.gridFile, (data) => {
            nodeResize('grid', Math.max(data.width, data.height));
            that.width = data.width * config.nodeSize;
            that.height = data.height * config.nodeSize;
            resolve(data);
          });
        }
        catch(e){
          reject(e);
        }
      });
    }
    return this._gridData;
  }

  /**
  * cells returns _cells if it is resolved. Else, sets it.
  * @type {object}
  * @public
  */
  get cells(){
    if(!this._cells){
      this._cells = this.gridData.then((gridData) => {
        return new Promise((resolve, reject) => {
          GridService.builder.build(gridData, resolve);
        });
      });
    }
    return this._cells;
  }
}

export default Grid;
