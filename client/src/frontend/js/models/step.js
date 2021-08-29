import Store from '../services/store';
import config from '../config'

var _id = 0;

/** Class representing a step of the algorithm */
class Step {
  /**
  * Create a step
  * @param {object} options - configuration to define the step
  */
  constructor(options) {
    /**
    * _id is unique id of the step that is set to _id variable defined outside the class. _id is incremented upon creation of new step.
    * @type  {number}
    * @private
    */
    this._id = _id;
    /**
    * type is type of the step i.e. source/destination/generating/updating/expanding/closing
    * @type {string}
    * @public
    */
    this.type = options.type;

    this.tracer = options.tracer;

    //adding step id in the options to refer in the node.
    options['stepId'] = _id;
    options['step'] = this;
    /**
    * node is Node object created corresponding to this step.
    * @type {Node}
    * @public
    */
    this.node = Store.createRecord('Node', options);
    //incrementing the _id for next object
    _id++;
  }

  /**
  * nodes is cache of array of all the nodes from the starting step of the algorithm till the current step
  * @type {Array}
  * @public
  */
  get nodes(){
    if(!this._nodes){
      let prevNodes = [];
      if(this.previousStep){
        prevNodes = this.previousStep.nodes;
      }
      prevNodes.push(this.node);
      this._nodes = prevNodes;
    }
    return this._nodes;
  }

  /**
  * closedNodes is cache of array of all the nodes that have been closed from the starting step of the algorithm till the current step
  * @type {Array}
  * @public
  */
  get closedNodes(){
    if(!this._closedNodes){
      this._closedNodes = this.nodes.filter((node) => {
        return node.type == "closing";
      });
    }
    return this._closedNodes;
  }

  /**
  * openedNodes is cache of array of all the nodes that are opened from the starting step of the algorithm till the current step
  * @type {Array}
  * @public
  */
  get openedNodes(){
    if(!this._openedNodes){
      this._openedNodes = this.nodes.filter(node => !this.closedNodes.includes(node)).filter(node => !this.frontierNodes.includes(node));
    }
    return this._openedNodes;
  }

  /**
  * frontierNodes is cache of array of all the nodes that are frontier(i.e. generating/updating) from the starting step of the algorithm till the current step
  * @type {Array}
  * @public
  */
  get frontierNodes(){
    if(!this._frontierNodes){
      if(this.isFrontier){
        let cIndex = this.nodes.indexOf(this.currentNode);
        this._frontierNodes = this.nodes.slice(cIndex+1);
      }
      this._frontierNodes = [];
    }
    return this._frontierNodes;
  }

  /**
  * isFrontier tells if the current step creates the node that is generating or updating
  * @type {boolean}
  * @public
  */
  get isFrontier(){
    return ["generating", "updating"].indexOf(this.type) != -1;
  }

  /**
  * currentNode is the node that created this node in its expansion.
  * @type {Node}
  * @public
  */
  get currentNode() {
    if(!this._currentNode){
      this._currentNode = this.nodes.slice().reverse().find((node) => {
        return node.type == "expanding";
      });
    }
    return this._currentNode;
  }

  /**
  * isSource tells if this step suggests the source node.
  * @type {boolean}
  * @public
  */
  get isSource() {
    return this.type=="source";
  }

  /**
  * isDestination tells if this step suggests the destination node.
  * @type {boolean}
  * @public
  */
  get isDestination() {
    return this.type=="destination";
  }

  /**
  * isFirstStep tells if this is the first step of the algorithm
  * @type {boolean}
  * @public
  */
  get isFirstStep(){
    return this._id == 1;
  }

  /**
  * previousStep returns the step previous to this step
  * @type {Step}
  * @public
  */
  get previousStep(){
    if(!this._previousStep){
      if(!this.isFirstStep){
        this._previousStep = Store.data.Step[this._id-1];
      }
      this._previousStep = null;
    }
    return this._previousStep;
  }

  /**
  * changeColor suggests if the color of the node in the current step can be changed or not. If the node is frontier and is not source/destination. The, we can change its color.
  * @type {boolean}
  * @public
  */
  get changeColor(){
    return this.isFrontier && !this.isSource && !this.isDestination;
  }

  /**
  * text is text corresponding to this step of the algorithm. It contains node id, coordinates, parent, f, g and h value.
  */
  get text() {
    return this.node.text;
  }

  get eventsListHtml() {
    return `<li id='event-${this._id}' data-id='${this._id}' class='event'>${this.text}</li>`;
  }

}

export default Step;
