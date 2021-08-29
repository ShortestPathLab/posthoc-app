import * as PIXI from 'pixi.js'

export default {
  currentBuffer: null,

  insert(context, graphics, zIndex = 10){
    if(!graphics){
      return;
    }
    if(context.timeTravelling){
      if(!this.currentBuffer){
        this.currentBuffer = new PIXI.Container();
        this.currentBuffer.zIndex = 10;
      }
      this.currentBuffer.addChild(graphics);
    }
    else{
      context.stage.addChild(graphics);
    }
  },

  remove(context, graphics){
    if(!graphics){
      return;
    }
    if(graphics.parent){
      graphics.parent.removeChild(graphics);
    }
    else{
      context.stage.removeChild(graphics);
    }
  },

  flushBuffer(context){
    if(!this.currentBuffer){
      return;
    }
    context.stage.addChild(this.currentBuffer);
    this.currentBuffer = null;
  }
}
