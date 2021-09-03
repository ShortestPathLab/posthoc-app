import config from "../config";
import ConstraintForceLayoutService from "../services/constraint-force-layout";
import GraphicsManager from "../services/graphics-manager";
import Injector from "../services/injector";
import Store from "../services/Store.new";
import drawLine from "../utils/draw-line";

type Trace = any;

/**
 * Manages TraceViewer UI state given a Trace object.
 */
class Tracer {
  _id = 0;
  maxX = -1;
  maxY = -1;
  minX = Infinity;
  minY = Infinity;
  nodeStructure: any;
  layout: any;
  stateStructure: any;
  stateExpansion: any;
  source: any;
  destination: any;
  line: any;
  controller: any;
  childLines: any;

  constructor(public trace: Trace) {
    Injector.inject(this, ["controller"]);
    this.nodeStructure = trace.nodeStructure;
    this.layout = trace.layout;
    this.stateStructure = trace.stateStructure;
    this.stateExpansion = trace.stateExpansion;
    const eventsList = this.trace.eventList;
    eventsList.forEach((event: any) => {
      event.tracer = this;
      const step = Store.create("Step", event);
      if (!this.layout) {
        this.checkMax(step.node);
        this.checkMin(step.node);
      }
      if (event.type == "source") {
        this.source = step;
      }
      if (event.type == "destination") {
        this.destination = step;
      }
    });
    if (this.layout) {
      ConstraintForceLayoutService.process(this.layout);
      Store.all("Node").forEach((node) => {
        node.setNodeObjects();
        this.checkMax(node);
        this.checkMin(node);
      });
    }
  }

  get debugJson() {
    return this.trace;
  }

  get steps() {
    return Promise.resolve((Store?.data as any)?.Step);
  }

  get eventsListHtml() {
    return Promise.resolve(
      (Store?.data as any)?.Step.reduce(
        (htmlStr: any, step: any) => htmlStr + step.eventsListHtml,
        ""
      )
    );
  }

  checkMax(node: any) {
    if (node.maxX > this.maxX) {
      this.maxX = node.maxX;
    }
    if (node.maxY > this.maxY) {
      this.maxY = node.maxY;
    }
  }

  checkMin(node: any) {
    if (node.minX < this.minX) {
      this.minX = node.minX;
    }
    if (node.minY < this.minY) {
      this.minY = node.minY;
    }
  }

  get width() {
    return (this.maxX - this.minX) * config.nodeSize;
  }

  get height() {
    return (this.maxY - this.minY) * config.nodeSize;
  }

  _inspectedNodeObject: any;

  get inspectedNodeObject() {
    return this._inspectedNodeObject;
  }

  set inspectedNodeObject(nodeObject) {
    this.hideChildrenPath();
    this.lightenChildrenNodeObjects();
    this.hideLinePath();
    this.lightenInspectedNodeObject();
    if (this._inspectedNodeObject == nodeObject) return;
    this._inspectedNodeObject = nodeObject;
    if (!this._inspectedNodeObject) return;
    this.darkenInspectedNodeObject();
    this.darkenChildrenNodeObjects();
    this.showLinePath();
    this.showChildrenPath();
  }

  hideLinePath() {
    if (!this.inspectedNodeObject || !this.line) return;
    GraphicsManager.remove(this.controller, this.line);
    this.line = null;
  }

  showLinePath() {
    let linePoints = this.inspectedNodeObject.node.linePoints;
    this.line = drawLine(this.controller, linePoints, 0xe40e40);
  }

  hideChildrenPath() {
    if (
      !this.inspectedNodeObject ||
      !this.childLines ||
      !this.childLines.length
    )
      return;
    this.childLines.forEach((line: any) => {
      GraphicsManager.remove(this.controller, line);
    });
    this.childLines = [];
  }

  showChildrenPath() {
    let node = this.inspectedNodeObject.node;
    if (node.type != "closing" || !node.pId) {
      return;
    }
    let expandingNode = node.sameExpandingNode;
    if (!expandingNode) {
      return;
    }
    this.childLines = [];
    expandingNode.childNodes.forEach((childNode: any) => {
      let linePoints = [childNode.center, node.center];
      let line = drawLine(this.controller, linePoints, 0xffe119);
      this.childLines.push(line);
    });
  }

  darkenChildrenNodeObjects() {
    let node = this.inspectedNodeObject.node;
    if (node.type != "closing" || !node.pId) {
      return;
    }
    let expandingNode = node.sameExpandingNode;
    if (!expandingNode) {
      return;
    }
    expandingNode.childNodes.forEach((childNode: any) => {
      let currentStateChildNode = childNode.currentStateNode(
        this.controller.currentId
      );
      let childNodeObjects = currentStateChildNode.persistedObjects;
      childNodeObjects.forEach((nodeObject: any) => {
        nodeObject.graphics.tint = config.nodeAttrs.frontier.fillColor;
      });
    });
  }

  lightenChildrenNodeObjects() {
    if (!this.inspectedNodeObject) return;
    let node = this.inspectedNodeObject.node;
    let expandingNode = node.sameExpandingNode;
    if (!expandingNode) {
      return;
    }
    expandingNode.childNodes.forEach((childNode: any) => {
      let currentStateChildNode = childNode.currentStateNode(
        this.controller.currentId
      );
      let childNodeObjects = currentStateChildNode.persistedObjects;
      childNodeObjects.forEach((nodeObject: any) => {
        nodeObject.graphics.tint = "0xFFFFFF";
      });
    });
  }

  darkenInspectedNodeObject() {
    this.controller.executeFloatbox();
    this.inspectedNodeObject.graphics.tint =
      this.inspectedNodeObject.node.attrs.fillStyle;
  }

  lightenInspectedNodeObject() {
    if (!this.inspectedNodeObject) return;
    this.inspectedNodeObject.graphics.tint = "0xFFFFFF";
  }
}

export default Tracer;
