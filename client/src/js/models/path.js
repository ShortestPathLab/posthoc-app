import * as PIXI from 'pixi.js'

import NodeObject from './node-object';
import config from '../config'
import Injector from '../services/injector';

let _id = 0;

class Path extends NodeObject {
  constructor(options){
    super(options.nodeConf);
    this._id =_id;
    Object.assign(this, options.coordinates);
    _id++;
  }
  createGraphics(attrs){
    let _graphics = new PIXI.Graphics();
    _graphics.lineStyle(2, attrs.fillStyle);
    _graphics.beginFill(attrs.fillStyle);
    attrs.linePoints.forEach((point, index) => {
      if(index == 0){
        _graphics.moveTo(point.x, point.y);
      }
      else{
        _graphics.lineTo(point.x, point.y);
      }
    });
    _graphics.endFill();
    _graphics.buttonMode=true;
    _graphics.on("mouseover", (e) => {
      _graphics.tint=attrs.fillStyle;
    });
    _graphics.on("mouseout", () => {
      _graphics.tint="0xFFFFFF";
    });
    Injector.inject(this, ['renderer']);
    return _graphics;
  }
  get graphics(){
    if(!this._graphics){
      this._graphics = this.createGraphics(this.node.attrs);
    }
    return this._graphics;
  }
  get maxX(){
    return Math.max(this.x1, this.x2);
  }
  get maxY(){
    return Math.max(this.y1, this.y2);
  }
  get minX(){
    return Math.min(this.x1, this.x2);
  }
  get minY(){
    return Math.min(this.y1, this.y2);
  }
}

export default Path;
