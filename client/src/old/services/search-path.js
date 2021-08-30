import config from '../config';
import Controller from '../controller';
import GraphicsManager from '../services/graphics-manager';
import drawLine from '../utils/draw-line';

let SearchPathService = {
  init(context){
    this.context = context;
    //history => history is history of lines drawn at each step.
    this.history = [];
    //current => The current is line PIXI.Graphics object which is basically a line drawn from current node to the source.
    this.current = null;
  },

  get currentId(){
    return this.context.currentId;
  },

  /**
  * @function update
  * This function removes the previous line drawn and adds the current line on the screen. Line is from source to the current node.
  * @param {Node} node
  */
  update(){
    GraphicsManager.remove(this.context, this.getLine(this.currentId - 1));
    let line = this.getLine(this.currentId);
    GraphicsManager.insert(this.context, line, 5);
  },

  getLine(id){
    let step = this.context.steps[id];
    if(step){
      let node = step.node;
      let line = node.searchPath;
      line.zIndex = 5;
      return line;
    }
  },

  retraceHistory(id){
    let currentLine = this.getLine(this.currentId);
    GraphicsManager.remove(this.context, currentLine);
    let line = this.getLine(id);
    GraphicsManager.insert(this.context, line, 5);
  },

  clearFuture(){
    // this.history.length = this.currentId;
  },

  clean(){
    for(let i = 1; i<=this.currentId; i++){
      let line = this.getLine(i);
      GraphicsManager.remove(this.context, line);
    }
  },

  reset(){
    this.context.currentId = 0;
    // this.history = [];
  },

  stepBackward(){
    let line = this.getLine(this.currentId);
    GraphicsManager.remove(this.context, line);
    GraphicsManager.insert(this.context, this.getLine(this.currentId), 5);
  }
}

export default SearchPathService;
