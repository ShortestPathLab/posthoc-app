import * as PIXI from 'pixi.js'

import config from '../config';
import FloatboxService from '../services/floatbox';
import Controller from '../controller';

/**
 * @function nodeFactory
 * This function creates a PIXI.Graphics object with given attributes, binds floatbox service with the given values and bind mouseout and mouseover events.
 * @param {Object} attrs
 * @param {Object} attrs
 * @return {PIXI.Graphics}
*/
export default function(attrs, values){
  let rectangle = new PIXI.Graphics();
  rectangle.lineStyle(1, attrs.strokeStyle);
  rectangle.beginFill(attrs.fillStyle);
  rectangle.drawRect(attrs.x, attrs.y, attrs.width, attrs.height);
  rectangle.endFill();
  if(!attrs.isMap){
    rectangle.interactive=true;
    rectangle.buttonMode=true;
    rectangle.on("mouseover", (e) => {
      rectangle.tint=attrs.fillStyle;
      let position  = {
        x: Controller.x,
        y: Controller.y
      }
      FloatboxService.execute(e, values, position);
    });
    rectangle.on("mouseout", () => {
      rectangle.tint="0xFFFFFF";
    });
  }
  return rectangle;
};
