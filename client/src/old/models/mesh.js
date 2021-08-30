import config from '../config';
import MeshService from '../services/mesh';
import nodeResize from '../utils/node-resize';

class Mesh {
  constructor(meshFile) {
    this._id = 0;
    this.meshFile = meshFile;
    this._meshData = null;
    this._meshPolygons = null;
  }

  get meshData(){
    if(!this._meshData){
      let that = this;
      this._meshData = new Promise((resolve, reject) => {
        try{
          MeshService.parser.parse(that.meshFile, (data) => {
            that.width = data.maxX * config.nodeSize;
            that.height = data.maxY * config.nodeSize;
            resolve(data);
          });
        }
        catch(e){
          reject(e);
        }
      });
    }
    return this._meshData;
  }

  get meshPolygons(){
    if(!this._meshPolygons){
      this._meshPolygons = this.meshData.then((meshData) => {
        return new Promise((resolve, reject) => {
          MeshService.builder.build(meshData, resolve);
        });
      });
    }
    return this._meshPolygons;
  }
}

export default Mesh;
