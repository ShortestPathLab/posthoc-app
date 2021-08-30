import * as PIXI from 'pixi.js'

import NodeObject from './node-object';
import config from '../config';
import NodeStateService from '../services/node-state';
import Store from '../services/store';
import debounce from '../utils/debounce';

let _id = 0;

class Circle extends NodeObject {
  constructor(options){
    super(options.nodeConf);
    this._id = _id;
    Object.assign(this, options.coordinates);
    this.r = 0.25 * config.nodeSize;
    this.lineSize = 1;
    if(config.mapType && config.mapType == 'roadnetwork'){
      this.r = 2;
      this.lineSize = 0.75;
    }
    _id++;
  }

  createGraphics(attrs){
    let self = this;
    let _graphics = new PIXI.Graphics();
    _graphics.lineStyle(this.lineSize, attrs.strokeStyle);
    _graphics.beginFill(attrs.fillStyle);
    _graphics.drawCircle(this.cx*config.nodeSize, this.cy*config.nodeSize, this.r);
    _graphics.endFill();
    _graphics.interactive=true;
    _graphics.buttonMode=true;
    _graphics.on("mouseover", () => {
      _graphics.tint = attrs.fillStyle;
    });
    _graphics.on("mouseout", () => {
      if (self.node.tracer.inspectedNodeObject == self) return;
      _graphics.tint = "0xFFFFFF";
    });
    self.nodesHidden = true;
    let toggleNodes = debounce(function(){
      let circles = Store.where("Circle", {cx: self.cx, cy: self.cy});
      circles.forEach((circle) => {
        circle.node.showUnPersistedPart();
      });
      self.node.tracer.inspectedNodeObject = self;
    });
    _graphics.on("click", () => {
      toggleNodes();
    });
    let tracer = Store.find("Tracer");
    if(tracer.stateStructure){
      _graphics.on("click", () => {
        NodeStateService.process(self.node.state_variables);
      });
    }
    return _graphics;
  }

  get graphics(){
    if(!this._graphics){
      this._graphics = this.createGraphics(this.node.attrs);
    }
    return this._graphics;
  }
  
  get center(){
    return {x: config.nodeSize*(this.cx), y: config.nodeSize*(this.cy)};
  }

  get maxX(){
    return this.cx;
  }

  get maxY(){
    return this.cy;
  }

  get minX(){
    return this.cx;
  }

  get minY(){
    return this.cy;
  }

}

export default Circle;
