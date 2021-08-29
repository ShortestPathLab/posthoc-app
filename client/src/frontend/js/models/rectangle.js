import * as PIXI from 'pixi.js'

import NodeObject from './node-object';
import config from '../config';
import debounce from '../utils/debounce';

let _id = 0;

class Rectangle extends NodeObject {
  constructor(options){
    super(options.nodeConf);
    this._id = _id;
    Object.assign(this, options.coordinates);
    _id++;
  }

  createGraphics(attrs){
    let self = this;
    let _graphics = new PIXI.Graphics();
    _graphics.lineStyle(1, attrs.strokeStyle);
    _graphics.beginFill(attrs.fillStyle);
    _graphics.drawRect(this.x * config.nodeSize, this.y * config.nodeSize, config.nodeSize, config.nodeSize);
    _graphics.endFill();
    _graphics.interactive=true;
    _graphics.buttonMode=true;
    _graphics.on("mouseover", () => {
      _graphics.tint = attrs.fillStyle;;
    });
    _graphics.on("mouseout", () => {
      if (self.node.tracer.inspectedNodeObject == self) return;
      _graphics.tint = "0xFFFFFF";
    });
    self.nodesHidden = true;
    let toggleNodes = debounce(function(){
      self.node.tracer.inspectedNodeObject = self;
    });
    _graphics.on("click", () => {
      toggleNodes();
    });
    return _graphics;
  }
  
  get graphics(){
    if(!this._graphics){
      this._graphics = this.createGraphics(this.node.attrs);
    }
    return this._graphics;
  }

  get center(){
    return {x: config.nodeSize*(this.x+0.5), y: config.nodeSize*(this.y+0.5)}
  }

  get maxX(){
    return this.x;
  }

  get maxY(){
    return this.y;
  }

  get minX(){
    return this.x;
  }

  get minY(){
    return this.y;
  }
}

export default Rectangle;
