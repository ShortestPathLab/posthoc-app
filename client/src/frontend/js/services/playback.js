import StateMachine from "javascript-state-machine";

/** @module services/playback
* This service is responsible for giving playback controls to the app. It is a StateMachine with 4 states: none, ready, paused and running. Init transition changes state from none to ready. Play transition changes state from ready/paused to running. Pause transition changes state from running to paused. Reset transition changes state to ready.
*/
let PlaybackService = new StateMachine({
  transitions: [{
        name: 'init',
        from: 'none',
        to: 'ready'
      },
      {
        name: 'play',
        from: ['ready', 'paused'],
        to: 'running'
      },
      {
        name: 'pause',
        from: 'running',
        to: 'paused'
      },
      {
        name: 'reset',
        from: '*',
        to: 'ready'
      }
    ],

    /**
    * Data of this state machine has callbacks corresponding to each transition
    */
    data: {
      initCallbacks: [],
      playCallbacks: [],
      pauseCallbacks: [],
      resetCallbacks: []
    },

    methods: {
      onPendingTransition(transition, from, to) {
        // debugger
      },
      onInvalidTransition(transition, from, to) {
        // debugger
      },
      /**
      * @function onInit
      * This lifecycle function is called when this service is initiated. It calls and the callbacks function corresponding to this transition
      */
      onInit(){
        this.runCallbacks('init');
      },

      /**
      * @function onPlay
      * This lifecycle function is called when this service is played. It calls and the callbacks function corresponding to this transition
      */
      onPlay(){
        this.runCallbacks('play');
      },

      /**
      * @function onPause
      * This lifecycle function is called when this service is paused. It calls and the callbacks function corresponding to this transition
      */
      onPause(){
        this.runCallbacks('pause');
      },

      /**
      * @function onReset
      * This lifecycle function is called when this service is reset. It calls and the callbacks function corresponding to this transition
      */
      onReset(){
        this.runCallbacks('reset');
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
          case "play":
            callbacks = this.playCallbacks;
            break;
          case "pause":
            callbacks = this.pauseCallbacks;
            break;
          case "reset":
            callbacks = this.resetCallbacks;
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
          case "play":
            this.playCallbacks.push(callback);
            break;
          case "pause":
            this.pauseCallbacks.push(callback);
            break;
          case "reset":
            this.resetCallbacks.push(callback);
            break;
        }
      }
    }
});
export default PlaybackService;
