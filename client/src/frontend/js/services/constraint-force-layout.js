import config from "../config";
import Store from "./store";
import * as d3 from "d3-hierarchy";

export default {
  process(layout) {
    if (layout == "tree") {
      this.processTree();
    } else if (layout == "graph") {
      this.processGraph();
    }
  },
  processTree() {
    let nodes = Store.all("Node");
    let obj = {};
    nodes.forEach((node) => {
      if (obj[node.id]) {
        obj[node.id]._ids.push(node._id);
        obj[node.id].id = node.id;
        obj[node.id].parentId = node.pId;
      } else {
        obj[node.id] = { id: node.id, parentId: node.pId, _ids: [node._id] };
      }
    });
    let table = Object.values(obj);
    let root = d3.stratify()(table);
    let height = root.height + 1;
    root = d3
      .tree()
      .nodeSize([1, 1])
      .size([(config.nodeSize * height) / 8, (config.nodeSize * height) / 8])(
      root
    );
    root.descendants().forEach((node) => {
      node.data._ids.forEach((_id) => {
        Store.data.Node[_id].variables = { x: node.x, y: node.y };
      });
    });
  },
  processGraph() {},
};
