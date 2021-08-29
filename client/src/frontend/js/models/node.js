import * as PIXI from "pixi.js";
import config from "../config";
import NodeObjectsProcessor from "../services/node-objects-processor";
import Store from "../services/store";
import nodeColor from "../utils/node-color";

let _id = 0;

/** Class representing a node */
class Node {
  /**
   * Create a node
   * @param {object} options - configuration to define the node
   */
  constructor(options) {
    /**
     * _id is unique id of the node that is set to _id variable defined outside the class. _id is incremented upon creation of new node.
     * @type  {number}
     * @private
     */
    this._id = _id;
    /**
     * _linePoints is array of all the points from this node to the source node
     * @type {Array}
     * @private
     */
    this._linePoints = null;

    //assigning the options configuration to the node
    let variables = options.variables;

    delete options.variables;

    Object.assign(this, options);

    if (!this.step.tracer.layout) {
      variables = { variables: this.setVariables(variables) };

      Object.assign(this, variables);
      //setting up node nodeObjects
      this.setNodeObjects();
    }

    //incrementing the _id for next object
    _id++;
  }

  setVariables(variables) {
    return variables || this.generatingNode.variables;
  }

  get generatingNode() {
    return Store.where("Node", { type: "generating", id: this.id })[0];
  }

  setNodeObjects() {
    this.nodeObjects = NodeObjectsProcessor.process(this);
  }

  get unPersistedObjects() {
    return this.nodeObjects.filter((nodeObject) => !nodeObject.persisted);
  }

  get persistedObjects() {
    return this.nodeObjects.filter((nodeObject) => nodeObject.persisted);
  }

  hideUnPersistedPart() {
    if (this.type == "closing") {
      let nodesToHide = Store.where("Node", { id: this.id });
      nodesToHide.forEach((node) => {
        node.unPersistedObjects.forEach((nodeObject) => nodeObject.hide());
      });
    }
  }

  showUnPersistedPart() {
    this.unPersistedObjects.forEach((nodeObject) => nodeObject.show());
  }

  /**
   * attrs is  attributes of node contains its coordinates, size, color, border. These are used to draw the node
   * @type {object}
   * @public
   */
  get attrs() {
    //getting attributes of node based on its type
    let nodeAttrs = config.nodeAttrs[nodeColor[this.type]];
    //if current node is source, disregard if it is being opened/updated/closed. retain its color
    if (this.id == this.step.tracer.source.node.id) {
      nodeAttrs = config.nodeAttrs["source"];
    }
    //if current node is destination, disregard if it is being opened/updated/closed. retain its color
    if (
      this.step.tracer.destination &&
      this.id == this.step.tracer.destination.node.id
    ) {
      nodeAttrs = config.nodeAttrs["destination"];
    }

    return {
      fillStyle: nodeAttrs.fillColor,
      strokeStyle: config.borderColor,
      strokeWidth: config.borderWidth,
    };
  }

  get polygonAttrs() {
    //getting attributes of node based on its type
    let nodeAttrs = config.nodeAttrs[nodeColor[this.type]];
    //if current node is source, disregard if it is being opened/updated/closed. retain its color
    if (this.id == this.step.tracer.source.node.id) {
      nodeAttrs = config.nodeAttrs["source"];
    }
    //if current node is destination, disregard if it is being opened/updated/closed. retain its color
    if (
      this.step.tracer.destination &&
      this.id == this.step.tracer.destination.node.id
    ) {
      nodeAttrs = config.nodeAttrs["destination"];
    }

    return {
      fillStyle: nodeAttrs.lightColor,
      strokeStyle: config.borderColor,
      strokeWidth: config.borderWidth,
    };
  }

  /**
   * graphics is PIXI.Graphics object that is a rectangle to drawn on canvas using nodeFactory.
   * @type {PIXI.Graphics}
   * @public
   */
  get graphics() {
    if (!this._graphics) {
      let container = new PIXI.Container();
      container.zIndex = 10;
      this.nodeObjects.forEach((nodeObject) => {
        if (nodeObject.graphics) {
          container.addChild(nodeObject.graphics);
        }
      });
      this._graphics = container;
    }
    return this._graphics;
  }

  get lineNodeObjects() {
    return this.nodeObjects.filter((nodeObject) => nodeObject.type == "line");
  }

  get maxX() {
    return Math.max.apply(
      Math,
      this.nodeObjects.map((nodeObject) => nodeObject.maxX)
    );
  }

  get maxY() {
    return Math.max.apply(
      Math,
      this.nodeObjects.map((nodeObject) => nodeObject.maxY)
    );
  }

  get minX() {
    return Math.min.apply(
      Math,
      this.nodeObjects.map((nodeObject) => nodeObject.minX)
    );
  }

  get minY() {
    return Math.min.apply(
      Math,
      this.nodeObjects.map((nodeObject) => nodeObject.minY)
    );
  }

  /**
   * step is corresponding step object for this node in the algorithm.
   * @type {Step}
   * public
   */
  // get step(){
  //   return Store.data.Step[this.stepId];
  // }

  /**
   * parentNode is parent node
   * @type {Node}
   * public
   */
  get parentNode() {
    if (this.pId == null) {
      return null;
    }
    for (let i = this._id - 1; i >= 0; i--) {
      let node = Store.findById("Node", i);
      if (node && node.id == this.pId && node.type == "expanding") {
        return node;
      }
    }
    return null;
  }

  get sameExpandingNode() {
    if (this.type != "closing") {
      return null;
    }
    for (let i = this._id - 1; i > 0; i--) {
      let node = Store.findById("Node", i);
      if (node && node.id == this.id && node.type == "expanding") {
        return node;
      }
    }
    return null;
  }

  currentStateNode(currentId) {
    let latestNode = this;
    for (let i = this._id + 1; i <= currentId; i++) {
      let node = Store.findById("Node", i);
      if (node && node.id == this.id) {
        latestNode = node;
      }
      if (latestNode.type == "closing") {
        return latestNode;
      }
    }
    return latestNode;
  }

  get childNodes() {
    let nodes = [];
    if (this.type != "expanding") {
      return nodes;
    }
    const totalNodes = Store.count("Node");
    for (let i = this._id + 1; i < totalNodes; i++) {
      let node = Store.findById("Node", i);
      if (node.id == this.id && node.type == "closing") {
        return nodes;
      }
      if (node.pId == this.id) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  get uniqueChildNodes() {
    let nodes = [];
    if (this.type != "expanding") {
      return nodes;
    }
    for (let i = this._id - 1; i >= 0; i--) {
      let node = Store.find("Node", i);
      if (!node || node._id == this._id) {
        return nodes;
      }
      if (node.pId == this.id && nodes.every((n) => n.id !== node.id)) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  get siblingNodes() {
    if (!this.parentNode) {
      return [];
    }
    return this.parentNode.childNodes.filter((node) => node.id !== this.id);
  }

  get pathNodeObject() {
    return this.nodeObjects.find((nodeObject) => nodeObject.drawPath);
  }
  /**
   * center is ceter position of the current node.
   * @type {object}
   * @public
   */
  get center() {
    return this.pathNodeObject.center;
  }

  /**
   * linePoints returns cache of array of points from this node to the source node.
   * @type {Array}
   * @public
   */
  get linePoints() {
    if (!this._linePoints) {
      if (!this.parentNode) {
        return [this.center];
      }
      let points = this.parentNode.linePoints.slice();
      points.push(this.center);
      this._linePoints = points;
    }
    return this._linePoints;
  }

  get searchPath() {
    if (!this._searchPath) {
      let line = new PIXI.Graphics();
      // line.filters = [new GlowFilter()];
      let lineColor = config.lineColor;
      line.lineStyle(3, lineColor);
      this.linePoints.forEach((point, index) => {
        if (index == 0) {
          line.moveTo(point.x, point.y);
        } else {
          line.lineTo(point.x, point.y);
        }
      });
      this._searchPath = line;
    }
    return this._searchPath;
  }

  /**
   * values is search specific values i.e. type, id, parent id, f, g and h values for that node.
   * @type {object}
   * @public
   */
  get values() {
    let obj = {
      id: this.id,
      type: this.type,
      pId: this.pId,
      f: this.f,
      g: this.g,
      h: this.h,
    };
    if (config.mapType == "mesh") {
      obj["root"] = `(${this.variables.cx}, ${this.variables.cy})`;
      obj[
        "interval"
      ] = `(${this.variables.x1}, ${this.variables.y1}) - (${this.variables.x2}, ${this.variables.y2})`;
    }
    return obj;
  }

  get fValid() {
    if (this.type == "expanding" && this.parentNode) {
      return this.f >= this.parentNode.f ? true : false;
    }
    return true;
  }

  get gValid() {
    if (this.type == "expanding" && this.parentNode) {
      return this.g >= this.parentNode.g ? true : false;
    }
    return true;
  }

  /**
   * h value is calculated by adding f and g value
   * @type {number}
   * @public
   */
  get h() {
    return Number(this.f - this.g).toFixed(this.hDecimalPlaces);
  }

  get hDecimalPlaces() {
    let text = this.f.toString();
    let index = text.indexOf(".");
    let fLength = text.length - index - 1;
    text = this.g.toString();
    index = text.indexOf(".");
    let gLength = text.length - index - 1;
    return Math.min(fLength, gLength);
  }

  get text() {
    if (!this._text) {
      if (this.type == "source" || this.type == "destination") {
        if (config.mapType == "mesh") {
          this._text = `${this.type.toUpperCase()} Node (id: ${
            this.id
          }, root: (${this.variables.cx}, ${this.variables.cy}), interval: (${
            this.variables.x1
          }, ${this.variables.y1}) - (${this.variables.x2}, ${
            this.variables.y2
          }))`;
        } else {
          this._text = `${this.type.toUpperCase()} Node (id: ${
            this.id
          }, x: ${Number(this.variables.x).toFixed(2)}, y: ${Number(
            this.variables.y
          ).toFixed(2)})`;
        }
      } else {
        if (config.mapType == "mesh") {
          this._text = `${this.type.toUpperCase()} Node (id: ${
            this.id
          }, root: (${this.variables.cx}, ${this.variables.cy}), interval: (${
            this.variables.x1
          }, ${this.variables.y1}) - (${this.variables.x2}, ${
            this.variables.y2
          }), f: ${this.f}, g: ${this.g}, h: ${this.h}, pId: ${this.pId})`;
        } else {
          this._text = `${this.type.toUpperCase()} Node (id: ${
            this.id
          }, x: ${Number(this.variables.x).toFixed(2)}, y: ${Number(
            this.variables.y
          ).toFixed(2)}, f: ${this.f}, g: ${this.g}, h: ${this.h}, pId: ${
            this.pId
          })`;
        }
      }
    }
    return this._text;
  }

  get x() {
    return this.variables.x;
  }

  get y() {
    return this.variables.y;
  }
}

export default Node;
