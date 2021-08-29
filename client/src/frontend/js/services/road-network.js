import * as PIXI from 'pixi.js'

import Store from './store';
import Controller from '../controller';
import GraphicsManager from '../services/graphics-manager';
import config from '../config';

export default {
  parser: {
    coParse(file, callback) {
      let coReader = new FileReader();

      coReader.addEventListener("load", function(event) {
        let textFile = event.target;
        const data = textFile.result.split(/\n|\r\n/);
        let coordinates = [];
        let minX, minY;
        let maxX, maxY;
        for (let line of data) {
          if (line[0] == 'v') {
            let vline = line.split(" ");
            let x = Number(vline[2]);
            let y = Number(vline[3]);
            if (!minX || minX > x) {
              minX = x;
            }
            if (!minY || minY > y) {
              minY = y;
            }
            if (!maxX || maxX < x) {
              maxX = x;
            }
            if (!maxY || maxY < y) {
              maxY = y;
            }
            coordinates.push({
              x,
              y
            });
          }
        }
        maxX -= minX;
        maxY -= minY;
        coordinates = coordinates.map((c) => {
          return {
            x: (c.x - minX),
            y: (c.y - minY)
          }
        });
        coordinates.unshift(-1);
        callback({
          maxX,
          maxY,
          minX,
          minY,
          coordinates
        });
      });

      coReader.readAsText(file);
    },
    grParse(file, callback) {
      let grReader = new FileReader();

      grReader.addEventListener("load", function(event) {
        let textFile = event.target;
        const data = textFile.result.split(/\n|\r\n/);
        let lines = [];
        for (let line of data) {
          if (line[0] == 'a') {
            let aline = line.split(" ");
            let from = aline[1];
            let to = aline[2];
            lines.push([from, to]);
          }
        }
        callback({
          lines
        });
      });

      grReader.readAsText(file);
    }
  },
  renderMap(resolve, reject) {
    try{
      let roadNetwork = Store.find('RoadNetwork');
      roadNetwork.roadCoordinates.coData.then((coData) => {
        roadNetwork.roadGraph.grData.then((grData) => {
          Controller.setupRenderer();
          let mapSprite = new PIXI.Sprite.from(`${config.clientAddr}/maps/ny`);
          mapSprite.width = Controller.getDimensions().width;
          mapSprite.height = Controller.getDimensions().height;
          mapSprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
          mapSprite.texture.baseTexture.mipmap = true;
          GraphicsManager.insert(Controller, mapSprite);
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      });
    }
    catch(e){
      reject(e);
    }
  },
  sendToServer(resolve, reject) {
    let roadNetwork = Store.find('RoadNetwork');
    roadNetwork.roadCoordinates.coData.then((coData) => {
      roadNetwork.roadGraph.grData.then((grData) => {
        fetch(config.processRoadNetworkUrl, {
          method: "POST",
          body: JSON.stringify({
            coData: coData,
            grData: grData
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then((res) => res.json()).then((data) => {
          if (data.done) {
            this.renderMap(resolve, reject);
          }
          else{
            reject();
          }
        });
      });
    });
  },
  checkMap(resolve, reject){
    let map = Store.find("Map");
    var img = new Image();
    let self = this;
    img.onerror = function(){
      //send request to server
      self.sendToServer(resolve, reject);
    }
    img.onload = function(){
      //load map from image directly
      self.renderMap(resolve, reject);
      img = null;
    }
    img.src = `${config.clientAddr}/maps/ny`;
  },
  process() {
    return new Promise((resolve, reject) => {
      this.checkMap(resolve, reject);
    });
  },
  preProcess(resolve, reject) {
    this.checkMap(resolve, reject);
  }
}
