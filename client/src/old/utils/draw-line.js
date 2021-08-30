import * as PIXI from 'pixi.js'

import config from '../config';

/**
 * @function drawLine
 * This function draws the line from the array of line points
 * @param {Controller} context
 * @param {Array} linePoints
 * @return {PIXI.Graphics}
*/
export default function(context, linePoints, color){
  let line = new PIXI.Graphics();
  let lineColor = color ? color : config.lineColor;
  line.lineStyle(2, lineColor);
  linePoints.forEach((point, index) => {
    if(index == 0){
      line.moveTo(point.x, point.y);
    }
    else{
      line.lineTo(point.x, point.y);
    }
  });
  context.stage.addChild(line);
  return line;
}
