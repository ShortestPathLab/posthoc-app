import * as PIXI from 'pixi.js'

import config from '../config';
import FloatboxService from '../services/floatbox';
import Controller from '../controller';

export default function(attrs){
  let polygon = new PIXI.Graphics();
  polygon.lineStyle(1, attrs.strokeStyle);
  polygon.beginFill(attrs.fillStyle);
  polygon.drawPolygon(attrs.points);
  polygon.endFill();
  return polygon;
};
