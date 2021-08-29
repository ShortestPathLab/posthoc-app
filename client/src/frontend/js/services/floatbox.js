import StateMachine from "javascript-state-machine";
import $ from "jquery";
import debounce from "../utils/debounce";

/** @module services/floatbox
* This service is responsible for showing node information on mouse hover. It is a StateMachine with 3 states: none, hidden and shown. Init transition changes state from none to hidden. Show transition changes state from hidden to shown. Hide transition changes state from shown to hidden.
*/
let FloatboxService = new StateMachine({
  transitions: [{
        name: 'init',
        from: 'none',
        to: 'hidden'
      },
      {
        name: 'show',
        from: 'hidden',
        to: 'shown'
      },
      {
        name: 'hide',
        from: 'shown',
        to: 'hidden'
      }
    ],

    data: {
      values: null,
      initCallbacks: [],
      showCallbacks: [],
      hideCallbacks: []
    },

    methods: {

      /**
      * @function onInit
      * This lifecycle function is called when this service is initiated. It creates menu div element and appends it to the body. It also sets show and hide function for the div.
      */
      onInit(){
        let view = document.createElement('div');
        view.id = 'context-menu';
        view.style.display = 'none';
        $('body').append(view);
        this.execute = debounce(this.showMenu);
        this.bindHide();
      },

      /**
      * @function onHide
      * This lifecycle function hides the context menu
      */
      onHide(){
        this.runCallbacks('hide');
        $("#context-menu").hide();
      },

      /**
      * @function onShow
      * This lifecycle function shows the context menu
      */
      onShow(transition, values, position){
        this.runCallbacks('show');
        this.values = values;
        $("#context-menu").html(this.htmlStr());
        $("#context-menu").css("left",position.x + 5);
        $("#context-menu").css("top",position.y + 5);
        $("#context-menu").show();
      },

      /**
      * @function bindHide
      * This function hides the menu when the mouse is clicked outside the menu and when the state is hidden.
      */
      bindHide() {
        $(document).on("click",() => {
          if(this.state!="hidden"){
            this.hide();
          }
        });
      },

      /**
      * @function showMenu
      * This function hides previous menu(if any). Loads the menu witht he new information and shows it.
      */
      showMenu(values, position) {
        if(this.state!="hidden"){
          this.hide();
        }
        this.show(values, position);
      },

      /**
      * @function runCallbacks
      * This funciton runs all the callbacks corresponding to the transition type passed to it.
      * @param {string} type - type of transition
      */
       runCallbacks(type){
        let callbacks;
        switch (type) {
          case "init":
            callbacks = this.initCallbacks;
            break;
          case "show":
            callbacks = this.showCallbacks;
            break;
          case "hide":
            callbacks = this.hideCallbacks;
            break;
        }
        callbacks.forEach((callback) => {
          callback();
        });
      },

      /**
      * @function addCallback
      * This function adds callback function to the callbacks array of corresponding transition type
      * @param {string} type - type of transition
      * @param {function} callback - callback funciton
      */
       addCallback(type, callback){
        switch (type) {
          case "init":
            this.initCallbacks.push(callback);
            break;
          case "show":
            this.showCallbacks.push(callback);
            break;
          case "hide":
            this.hideCallbacks.push(callback);
            break;
        }
      },

      /**
      * @function htmlStr
      * This function returns ul element with latest values loaded.
      */
      htmlStr() {
        let str = `<ul id='node-details'>`;
        for(let variable in this.values){
          str+= `<li>${variable}: ${this.values[variable]}</li>`;
        }
        str+= `</ul>`;
        return str;
      }
    }
});
export default FloatboxService;
