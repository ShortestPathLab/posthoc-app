import $ from "jquery";
import DragResizeBoxService from "./drag-resize-box";

export default {
  init(stateStructure) {
    this.vars = stateStructure.defaultValues;
    this.svg = stateStructure.scaffold;
    this.map = stateStructure.map;
    this.scale = stateStructure.scale;
    this.primitives = stateStructure.primitives;
    this.node = this.createSvg();
    this.popup = this.setPopup();
  },
  setPopup() {
    let popup = document.createElement("div");
    popup.id = "svg-popup";
    document.body.appendChild(popup);
    return popup;
  },
  process(state_variables) {
    // this.setStateVariables(state_variables);
    // this.node = this.createNode(this.svg);
    this.vals = state_variables.overrideDefaultValues;
    this.objects = state_variables.newScaffoldComponents;
    this.node = this.createSvg();
    this.mapObj();
    this.updatePath();
    this.setAgents();
    this.setConflicts();
    let wrapper = this.htmlWrapper();
    DragResizeBoxService.init(wrapper);
    this.setPosition();
  },
  htmlWrapper() {
    let wrapper = document.createElement("div");
    wrapper.id = "node-state";
    wrapper.style.position = "absolute";
    // wrapper.style.margin = "10px";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.top = "0";
    wrapper.style.left = "0";
    let title = this.setTitle();
    wrapper.appendChild(title);
    wrapper.appendChild(this.node);
    return wrapper;
  },
  setTitle() {
    let title = document.createElement("div");
    title.id = "node-state-title";
    title.innerHTML = "Multi-agent Pathfinding";
    return title;
  },
  setPosition() {
    let rect = window.canvas.getBoundingClientRect();
    DragResizeBoxService.setPosition(rect.top, rect.width + rect.left);
  },
  updatePath() {
    if (!this.vals) {
      return;
    }
    for (const [k, v] of Object.entries(this.vals)) {
      this.vars[k] = v;
    }
  },
  mapObj() {
    const data = this.map.split(/\n|\r\n/);
    const dims = data.shift();
    const height = Number(dims.split(",")[0]);
    const width = Number(dims.split(",")[1]);
    const gridStr = data.reduce((f, e) => f + e, "");
    let whiteBigRect = this.drawRect({
      x: 0,
      y: 0,
      width: width * this.scale,
      height: height * this.scale,
      stroke: "#000",
      fill: "#fff",
      "stroke-width": "1.5",
    });
    this.node.appendChild(whiteBigRect);
    for (let i = 1; i < width; i++) {
      let horLine = this.drawLine({
        x1: 0,
        y1: i * this.scale,
        x2: width * this.scale,
        y2: i * this.scale,
        stroke: "#000",
        "stroke-width": "1.5",
      });
      this.node.appendChild(horLine);
    }
    for (let i = 1; i < height; i++) {
      let verLine = this.drawLine({
        x1: i * this.scale,
        y1: 0,
        x2: i * this.scale,
        y2: height * this.scale,
        stroke: "#000",
        "stroke-width": "1.5",
      });
      this.node.appendChild(verLine);
    }
    for (let i = 0; i < height; ++i) {
      for (let j = 0; j < width; ++j) {
        let x = j * this.scale;
        let y = i * this.scale;
        let stringIndex = i * width + j;
        if (gridStr[stringIndex] == "@") {
          let rect = this.drawRect({
            x: x,
            y: y,
            width: this.scale,
            height: this.scale,
            fill: "#CDCDCD",
            stroke: "#000",
          });
          this.node.appendChild(rect);
        }
      }
    }
  },
  drawRect(attrs) {
    let rect = document.createElementNS(this.vars.xlmns, "rect");
    rect.setAttributeNS(null, "x", attrs.x);
    rect.setAttributeNS(null, "y", attrs.y);
    rect.setAttributeNS(null, "width", attrs.width);
    rect.setAttributeNS(null, "height", attrs.height);
    rect.setAttributeNS(null, "stroke", attrs.stroke);
    rect.setAttributeNS(null, "fill", attrs.fill);
    rect.setAttributeNS(null, "stroke-width", attrs["stroke-width"]);
    return rect;
  },
  drawLine(attrs) {
    let line = document.createElementNS(this.vars.xlmns, "line");
    line.setAttributeNS(null, "x1", attrs.x1);
    line.setAttributeNS(null, "y1", attrs.y1);
    line.setAttributeNS(null, "x2", attrs.x2);
    line.setAttributeNS(null, "y2", attrs.y2);
    line.setAttributeNS(null, "stroke", attrs.stroke);
    line.setAttributeNS(null, "stroke-width", attrs["stroke-width"]);
    return line;
  },
  createSvg() {
    let svg = document.createElementNS(this.vars.xlmns, "svg");
    svg.setAttributeNS(null, "width", this.vars.width);
    svg.setAttributeNS(null, "height", this.vars.height);
    svg.setAttributeNS(null, "viewBox", this.vars.viewBox);
    svg.setAttributeNS(
      null,
      "preserveAspectRatio",
      this.vars.preserveAspectRatio
    );
    return svg;
  },
  setAgents() {
    let self = this;
    self.svg.forEach((elem) => {
      let primitive = self.primitives[elem.type];
      elem.elements.forEach((child) => {
        let obj = document.createElementNS(self.vars.xlmns, primitive.type);
        for (const [k, v] of Object.entries(primitive.props)) {
          let val = null;
          if (primitive.type == "path" && k == "d") {
            let pathStr =
              "M" +
              (self.vars[child[v]][0][0] * self.scale + self.scale / 2) +
              " " +
              (self.vars[child[v]][0][1] * self.scale + self.scale / 2);
            var myarray = self.vars[child[v]];
            const [, ...rest] = myarray;
            rest.forEach((l, indx) => {
              if (indx == rest.length - 1) {
                let xa = l[1] * self.scale + self.scale / 2;
                if (isNaN(xa)) {
                  console.log("=======");
                  console.log("NaN found");
                  console.log("=======");
                }
              }
              pathStr +=
                " L" +
                (l[0] * self.scale + self.scale / 2) +
                " " +
                (l[1] * self.scale + self.scale / 2);
            });
            val = pathStr;
          } else if (primitive.type == "rect" && k == "x") {
            val = child[v] * self.scale + self.scale / 4;
          } else if (primitive.type == "rect" && k == "y") {
            val = child[v] * self.scale + self.scale / 4;
          } else if (primitive.type == "circle" && k == "cx") {
            val = child[v] * self.scale + self.scale / 2;
          } else if (primitive.type == "circle" && k == "cy") {
            val = child[v] * self.scale + self.scale / 2;
          } else if (typeof child[v] == "number") {
            val = child[v] * self.scale;
          } else {
            val = self.vars[child[v]];
          }
          if (obj.nodeName == "path" && k == "d" && val.includes("NaN")) {
            console.log("=======");
            console.log("NaN found");
            console.log("=======");
          }
          obj.setAttributeNS(null, k, val);
        }
        if (primitive.message) {
          let msg = child[primitive.message];
          obj.addEventListener(
            "mouseover",
            self.svgMouseover.bind(self, obj, msg)
          );
          obj.addEventListener("mouseout", self.svgMouseout.bind(self));
        }
        self.node.appendChild(obj);
      });
    });
  },
  setConflicts() {
    let self = this;
    if (!self.objects) {
      return;
    }
    self.objects.forEach((obj) => {
      let primitive = self.primitives[obj.type];
      obj.children.forEach((child) => {
        let svgObj = document.createElementNS(self.vars.xlmns, primitive.type);
        if (primitive.type == "text") {
          svgObj.textContent = primitive.value;
        }
        for (const [k, v] of Object.entries(primitive.props)) {
          let val = null;
          if (typeof child[v] == "number") {
            val = child[v];
            if (k == "x") {
              val = child[v] * self.scale + self.scale / 4;
            }
            if (k == "y") {
              val = child[v] * self.scale + self.scale / 4;
            }
          } else {
            val = self.vars[child[v]];
          }
          svgObj.setAttributeNS(null, k, val);
        }
        if (primitive.message) {
          let msg = child[primitive.message];
          svgObj.addEventListener(
            "mouseover",
            self.svgMouseover.bind(self, svgObj, msg)
          );
          svgObj.addEventListener("mouseout", self.svgMouseout.bind(self));
        }
        self.node.appendChild(svgObj);
      });
    });
  },
  svgMouseover(elem, message) {
    let iconPos = elem.getBoundingClientRect();
    this.popup.style.left = iconPos.right + 20 + "px";
    this.popup.style.top = window.scrollY + iconPos.top - 60 + "px";
    this.popup.style.display = "block";
    this.popup.innerHTML = message;
  },
  svgMouseout(elem) {
    this.popup.style.display = "none";
  },
};
