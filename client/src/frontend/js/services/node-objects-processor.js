import Store from './store';
import config from '../config';

export default {
  process(node){
    let map = Store.find('Map');
    let mapType;
    if(map){
      mapType = map.mapType;
    }
    this.preprocess(node, mapType);
    return node.step.tracer.nodeStructure.map((obj) => {
      let nodeConf = JSON.parse(JSON.stringify(obj));
      delete nodeConf.variables;
      nodeConf.node = node;
      let coordinates = {};
      Object.keys(obj.variables).forEach((key) => {
        if(key=="points"){
          coordinates['points'] = [];
          obj.variables['points'].forEach((pt) => {
            coordinates['points'].push(node.variables[pt]);
          });
        }
        else{
          if(obj.variables[key].indexOf("parent:") == -1){
            coordinates[key] = node.variables[obj.variables[key]];
          }
          else{
            let parentNode = node.parentNode;
            let prop = obj.variables[key].split("parent:")[1];
            if(parentNode){
              coordinates[key] = parentNode.variables[prop];
            }
            else{
              coordinates[key] = node.variables[prop];
            }
          }
        }
      });
      let options = {nodeConf: nodeConf, coordinates: coordinates};
      switch (obj.type) {
        case "rectangle":
          return Store.createRecord('Rectangle', options);
        case "circle":
          return Store.createRecord('Circle', options);
        case "line":
          return Store.createRecord('Line', options);
        case "polygon":
          return Store.createRecord('Polygon', options);
      }
    });
  },
  preprocess(node, mapType){
    if(!mapType){
      return;
    }
    if(mapType == 'roadnetwork'){
      let roadNetwork = Store.find('RoadNetwork');
      let minX = roadNetwork.minX;
      let minY = roadNetwork.minY;
      node.variables.x -= minX;
      node.variables.y -= minY;
      node.variables.x *= config.roadNetworkScale;
      node.variables.y *= config.roadNetworkScale;
    }
  }
}
