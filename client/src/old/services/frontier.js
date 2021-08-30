import * as PIXI from "pixi.js";

import config from "../config";
import GraphicsManager from "../services/graphics-manager";

let FrontierService = {
  init(context) {
    this.context = context;
    //history => This is array of all the frontier nodes at each step of the algorithm
    this.history = [];
    //current => This is list of graphics object that are currently rendered on the screen.
    this.current = [];
  },

  get currentId() {
    return this.context.currentId;
  },

  get timeTravelling() {
    return this.context.timeTravelling;
  },

  /**
   * @function add
   * This function checks if the node can be frontier. If so, it adds it changes it creates a new node with frontier color and node attributes and renders it on the screen. Additionally, it adds it to the current and history as well.
   * @param {Node} node
   */
  update() {
    let step = this.context.steps[this.currentId];
    let node = step?.node;
    if (node?.step?.changeColor) {
      let attrs = node.attrs;
      attrs["fillStyle"] = config.nodeAttrs["frontier"].fillColor;
      let graphicsContainer = new PIXI.Container();
      graphicsContainer.zIndex = 10;
      node.nodeObjects.forEach((nodeObject) => {
        let graphics = nodeObject.createGraphics(attrs);
        if (graphics) {
          graphicsContainer.addChild(graphics);
        }
      });
      GraphicsManager.insert(this.context, graphicsContainer);
      this.current.push(graphicsContainer);
    }
    this.history[this.currentId] = this.current.slice();
    if (step?.type == "closing") {
      this.clearCurrent();
    }
  },

  /**
   * @function clearCurrent
   * This function remove all the current from the screen, current and history.
   */
  clearCurrent() {
    this.clean();
    this.current = [];
    this.history[this.currentId] = [];
  },

  clean() {
    this.current.forEach((graphicsContainer) => {
      GraphicsManager.remove(this.context, graphicsContainer);
    });
  },

  clearFuture() {
    this.history.length = this.currentId;
  },

  reset() {
    this.current = [];
    this.history = [];
  },

  retraceHistory(id) {
    this.current = this.history[id];
    this.current.forEach((graphicsContainer) => {
      GraphicsManager.insert(this.context, graphicsContainer);
    });
  },

  stepBackward() {
    let prevFrontiers = this.history[this.currentId - 1];
    let frontiers = this.history.pop();
    if (this.currentId == 0) {
      return;
    }
    this.current = prevFrontiers;
    if (frontiers && frontiers.length) {
      let difference = frontiers.filter((x) => !prevFrontiers.includes(x));
      difference.forEach((graphicsContainer) => {
        GraphicsManager.remove(this.context, graphicsContainer);
      });
    } else if (prevFrontiers && prevFrontiers.length) {
      prevFrontiers.forEach((graphicsContainer) => {
        GraphicsManager.insert(this.context, graphicsContainer);
      });
    }
  },
};

export default FrontierService;
