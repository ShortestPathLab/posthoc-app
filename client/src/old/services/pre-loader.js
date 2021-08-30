import Store from './store';
import Spinner from './spinner';
import GridService from './grid';
import MeshService from './mesh';
import RoadNetworkService from './road-network';
import $ from 'jquery';
import config from "../config";

export default {
  preload: false,
  init(controller){
    this.controller = controller;
    if(window.postFiles){
      this.preload = true;
      this.loadVars();
    }
  },
  loadVars(){
    Object.assign(this, window.postFiles);
  },
  createRecords(){
    let fileType = this.mapType;
    let fileName = this.mapName;
    let self = this;
    let map = Store.createRecord("Map", {fileType: self.mapType, fileName: self.mapName});
    return new Promise((resolve, reject) => {
      switch (self.mapType) {
        case "grid":
          $.get(self.gridFile, (data) => {
            let file = new File(data.replace(/\n/g, "XXX\nXXX").split("XXX"), `${self.mapName}.${self.mapType}`, {
              type: "text/plain",
            });
            Store.createRecord('Grid', file);
            GridService.preProcess(resolve, reject)
          });
          break;
        case "mesh":
          $.get(self.meshFile, (data) => {
            let file = new File(data.replace(/\n/g, "XXX\nXXX").split("XXX"), `${self.mapName}.${self.mapType}`, {
              type: "text/plain",
            });
            Store.createRecord('Mesh', file);
            MeshService.preProcess(resolve, reject)
          });
          break;
        case "roadnetwork":
          $.when($.get(self.coFile), $.get(self.grFile)).then((coData, grData) => {
            let coFile = new File(coData[0].replace(/\n/g, "XXX\nXXX").split("XXX"), `${self.mapName}.co`, {
              type: "text/plain",
            });
            let grFile = new File(grData[0].replace(/\n/g, "XXX\nXXX").split("XXX"), `${self.mapName}.gr`, {
              type: "text/plain",
            });
            Store.createRecord('RoadNetwork', {coFile, grFile});
            RoadNetworkService.preProcess(resolve, reject)
          });
          break;
      }
    })
  },
  loadMap(){
    if(!this.preload){
      return;
    }
    if(!this.mapType){
      return;
    }
    Spinner.show();

    let promise = this.createRecords();

    config.mapType = this.mapType;

    promise.finally(() => {
      Spinner.hide();
    });

    this.mapTitle = `${this.mapName}(${this.mapType})`;
    this.controller.postLoadMap();
    return promise;
  },
  loadTrace(){
    if(!this.preload){
      return;
    }
    let self = this;
    $.get(self.traceFile, (data) => {
      let fileData = JSON.stringify(data);
      let file = new File(fileData.replace(/\n/g, "XXX\nXXX").split("XXX"), `${self.traceName}.json`, {
        type: "text/plain",
      });
      Store.createRecord('Tracer', file);
      this.controller.postLoadTrace();
    });

  }
}
