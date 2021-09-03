import config from "../config";
import Controller from "../controller";
import GraphicsManager from "../services/graphics-manager";
import NodeStateService from "../services/node-state";
import Store from "./Store.new";
import * as PIXI from "pixi.js";

let HistoryService = {
  init(context) {
    this.context = context;
    //history => History is array of all the nodes at each step of the algorithm
    this.history = [];
    this.timeTravelStartId = null;
    this.timeTravelEndId = null;
  },

  get currentId() {
    return this.context.currentId;
  },

  get timeTravelling() {
    return this.context.timeTravelling;
  },

  update() {
    if (this.timeTravelling) {
      if (!this.timeTravelStartId) {
        this.timeTravelStartId = this.currentId;
      }
    } else {
      //hide non persisted previous step node
      if (this.currentId > 0) {
        let previousStep = this.context.steps[this.currentId - 1];
        previousStep.node.hideUnPersistedPart();
      }
      let graphicsContainer = this.getGraphicsContainer(this.currentId);
      GraphicsManager.insert(this.context, graphicsContainer);
      this.drawState();
    }
  },
  //preallocate array based on jump value! to avoid lazy copying
  flush() {
    this.timeTravelEndId = this.currentId;
    let timeTravelContainer = new PIXI.Container();
    timeTravelContainer.zIndex = 10;
    let nodeHash = {};
    for (
      let id = this.timeTravelEndId - 1;
      id >= this.timeTravelStartId;
      id--
    ) {
      let step = this.context.steps[id];
      let node = step.node;
      if (!nodeHash[node.id]) {
        nodeHash[node.id] = this.getGraphicsContainer(id);
      }
    }
    for (let id in nodeHash) {
      timeTravelContainer.addChild(nodeHash[id]);
    }
    GraphicsManager.insert(this.context, timeTravelContainer);
    let previousStep = this.context.steps[this.timeTravelEndId - 1];
    previousStep.node.hideUnPersistedPart();
    let graphicsContainer = this.getGraphicsContainer(this.timeTravelEndId);
    GraphicsManager.insert(this.context, graphicsContainer);
    this.timeTravelStartId = null;
    this.timeTravelEndId = null;
  },

  /**
   * @function updateId
   * This function increments the running currentId
   */
  updateId() {
    this.context.currentId += 1;
  },

  getTracer() {
    return Store.get("Tracer");
  },

  getNode(id) {
    if (!id) {
      id = this.currentId;
    }
    let step = this.context.steps[id];
    if (step) {
      return step.node;
    }
  },

  getGraphicsContainer(id) {
    let node = this.getNode(id);
    if (node) {
      return node.graphics;
    }
  },

  retraceHistory(id) {
    for (let i = 1; i <= id; i++) {
      let graphicsContainer = this.getGraphicsContainer(i);
      GraphicsManager.insert(this.context, graphicsContainer);
    }
    this.context.currentId = id + 1;
  },

  clearFuture() {
    // this.history.length = this.currentId;
  },

  clean() {
    for (let i = 1; i <= this.currentId; i++) {
      let graphicsContainer = this.getGraphicsContainer(i);
      GraphicsManager.remove(this.context, graphicsContainer);
    }
  },

  reset() {
    this.context.currentId = 0;
    // this.history = [];
  },

  // Draw State if each node represents a state.
  drawState() {
    if (this.getTracer().stateStructure && this.getNode(this.currentId)) {
      NodeStateService.process(this.getNode(this.currentId).state_variables);
    }
  },

  stepBackward() {
    let graphicsContainer = this.getGraphicsContainer(this.currentId);
    GraphicsManager.remove(this.context, graphicsContainer);
    this.drawState();
  },
};

export default HistoryService;
