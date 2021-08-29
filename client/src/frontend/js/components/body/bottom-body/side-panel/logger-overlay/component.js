import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../../../../base-component';
import PlaybackService from '../../../../../services/playback';
import { interaction } from "pixi.js";

/**
* @module components/logger-overlay
* This component handles the overlay on display of events of algorithms on the panel when running
*/
let LoggerOverlayComponent = new StateMachine($.extend({}, BaseComponent, {
  data: {
    events: []
  },
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      // $("#side-panel").append("<div id='events-list'></div>");
      $("#events-list").append("<div id='logger-overlay' style='display:none;'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file, initiates event binding and callback binding.
    */
    onLeaveNone() {
      $("#logger-overlay").html(template);
      this.bindCallbacks();
      this.bindEvents();
    },

    /**
    * @function bindCallbacks
    * This function add the playback functions to playback callback service.
    */
    bindCallbacks() {
    },

    bindEvents() {
    },

    /**
    * @function play
    * This function hides the event list when algorithm is running.
    */
     play() {
      $("#logger-overlay").show();
    },

    /**
    * @function pause
    * This function shows the event list when algorithm is paused.
    */
    pause() {
      $("#logger-overlay").hide();
    },

    /**
    * @function reset
    * This function hides the event list when algorithm is stopped.
    */
    reset() {
      $("#logger-overlay").hide();
    },

    setNode(node) {
      $('#logger-overlay-text .parent-node-text').hide();
      $('#logger-overlay-text .overlay-text-hr').hide();
      $('#logger-overlay-text .current-node-text').hide();
      if(!node) {
        return;
      }
      let parentNode = node.parentNode;
      if(parentNode){
        $('#logger-overlay-text .parent-node-text').show();
        $('#logger-overlay-text .overlay-text-hr').show();
        $('#logger-overlay-text .parent-node-body').text(parentNode.text);
      }
      $('#logger-overlay-text .current-node-text').show();
      $('#logger-overlay-text .current-node-body').text(node.text);
    }
  }
}));

export default LoggerOverlayComponent;
