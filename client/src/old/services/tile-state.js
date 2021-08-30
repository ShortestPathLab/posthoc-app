import $ from "jquery";
import DragResizeBoxService from "./drag-resize-box";

export default {
  init(stateStructure) {
    this.vars = stateStructure.defaultValues;
    this.svg = stateStructure.scaffold;
  },
  process(state_variables) {
    this.setStateVariables(state_variables);
    this.node = this.createNode(this.svg);
    let wrapper = this.htmlWrapper();
    DragResizeBoxService.init(wrapper);
    this.setPosition();
  },
  setStateVariables(state_variables) {
    let valVariables = state_variables.overrideDefaultValues;
    let refVariables = state_variables.scaffoldValues;
    this.state_vars = JSON.parse(JSON.stringify(this.vars));
    for (const [k, v] of Object.entries(valVariables)) {
      this.state_vars[k] = v;
    }
    for (const [k, v] of Object.entries(refVariables)) {
      this.state_vars[k] = this.state_vars[v];
    }
  },
  createNode(obj) {
    let type = obj.type;
    let props = obj.props;
    let children = obj.children;
    let node = document.createElementNS(this.vars.xlmns, type);
    if (type == "text") {
      node.textContent = this.state_vars[obj.value];
    }
    for (const [k, v] of Object.entries(props)) {
      let val = this.state_vars[v];
      node.setAttributeNS(null, k, val);
    }
    children.forEach((child) => {
      node.appendChild(this.createNode(child));
    });
    return node;
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
    title.innerHTML = "Sliding Tile";
    return title;
  },
  setPosition() {
    let rect = window.canvas.getBoundingClientRect();
    DragResizeBoxService.setPosition(rect.top, rect.width + rect.left);
  },
};
