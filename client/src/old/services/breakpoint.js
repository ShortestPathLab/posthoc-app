let BreakpointService = {
  bps: [],
  bpFActive: true,
  bpGActive: true,
  comparatorNodes: [],
  get bpApplied(){
    return !!this.bps.length;
  },
  check(node){
    return this.manualCheck(node, this.bpApplied, this.bps) + this.automaticCheck(node) + this.comparatorCheck(node);
  },
  setComparatorNodes(errorNodes){
    this.comparatorNodes = errorNodes;
  },
  setBps(bps){
    this.bps = bps;
  },
  comparatorCheck(node){
    let message = ``;
    if(this.comparatorNodes[node._id]){
      message += `The value of g for the current node is ${node.g} which is different from the value in the correct reference trace (${this.comparatorNodes[node._id]}) <br>`;
    }
    return message;
  },
  manualCheck(node, bpApplied, bps){
    let message = ``;
    let valid = true;
    if(bpApplied){
      for(let i=0; i<this.bps.length; i++){
        let bp = this.bps[i];
        let bpNodeType = bp.nodeType;
        if(bpNodeType.indexOf(node.type) == -1){
          continue;
        }
        let compareVal = node[bp.operand];
        switch (bp.operator) {
          case "less than":
            valid = compareVal < parseInt(bp.val) ? false : true;
            break;
          case "equal to":
            valid = compareVal == parseInt(bp.val) ? false : true;
            break;
          case "greater than":
            valid = compareVal > parseInt(bp.val) ? false : true;
            break;
        }
        if(!valid){
          message += `The value of ${bp.operand} for the current node is ${compareVal} which is ${bp.operator} the breakpoint value i.e. ${bp.val} <br>`;
        }
      }
    }
    return message;
  },
  automaticCheck(node){
    let message = ``;
    //TODO: Compare each node's h value with source's h value and it should be less.
    //Only for nodes that are on the path.
    //Admissibility test:
    //Take solution cost - g value of the node. > distance from node to the target. That optimal cost should always be never smaller than heuristic value estimates from every node on the path.
    //
    if(this.bpGActive && !node.gValid){
      message += `The g value of current node(${node.g}) being expanded is less than that of its parent(${node.parentNode.g}). This indicates that a negative cost cycle might exist in the graph and is certainly an error. <br>`;
    }
    if(this.bpFActive && !node.fValid){
      message += `The f value of current node(${node.f}) being expanded is less than that of its parent(${node.parentNode.f}). This indicates an inadmissible heuristic function and might be an error. <br>`;
    }
    return message;
  },
  monotonicF(state){
    this.bpFActive = state;
  },
  monotonicG(state){
    this.bpGActive = state;
  }
}

export default BreakpointService;
