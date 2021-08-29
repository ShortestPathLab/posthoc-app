import * as PIXI from 'pixi.js'

import NodeObject from './node-object';
import config from '../config'
import Injector from '../services/injector';

let _id = 0;

class Text extends NodeObject {
  constructor(options){
    super(options.nodeConf);
    this._id =_id;
    Object.assign(this, options.coordinates);
    _id++;
  }
  createGraphics(attrs){
    let fontFamily = attrs.fontFamily || "Arial";
    let fontSize = attrs.fontSize || 24;
    let fill = attrs.fill || 0x000000;
    let align = attrs.align || 'center';
    let text = attrs.text || "";
    let _graphics = new PIXI.Text(text, {fontFamily : fontFamily, fontSize: fontSize, fill: fill, align : align});
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

export default Text;
