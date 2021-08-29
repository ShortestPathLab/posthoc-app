import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../../../../base-component';
import Controller from '../../../../../controller';
import TimeTravelService from '../../../../../services/time-travel';

/**
* @module components/playback-controls
* This component handles the playback controls buttons.
*/
let CameraControlsComponent = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#top-panel").append("<div id='camera-controls'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#camera-controls").html(template);
      this.hideAll();
      this.bindEvents();
    },

    /**
    * @function hideAll
    * This function hides all the buttons
    */
     hideAll(){
      this.hideMapControl();
      this.hideScaleControl();
      this.hideDebuggerControl();
    },

    hideMapControl(){
      $("#fit-map").prop('disabled', true);
    },

    showMapControl(){
      $("#fit-map").prop('disabled', false);
    },

    hideScaleControl(){
      $("#fit-scale").prop('disabled', true);
    },

    showScaleControl(){
      $("#fit-scale").prop('disabled', false);
    },

    hideDebuggerControl(){
      $("#fit-debugger").prop('disabled', true);
    },

    showDebuggerControl(){
      $("#fit-debugger").prop('disabled', false);
    },

    /**
    * @function bindEvents
    * This function calls the PlaybackService callbacks as per the button clicked
    */
    bindEvents() {
      $("#fit-map").on("click", () => {
        Controller.fitMap();
      });
      $("#fit-debugger").on("click", () => {
        Controller.fitDebugger();
      });
      $("#fit-scale").on("click", () => {
        Controller.fitScale();
      });
    }
  }
}));

export default CameraControlsComponent;
