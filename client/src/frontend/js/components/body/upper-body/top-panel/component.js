import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../../../base-component';

import BreakpointsComponent from './breakpoints/component';
import ComparatorComponent from './comparator/component';
import DebuggerComponent from './debugger/component';
import MapComponent from './map/component';
import PlaybackControlsComponent from './playback-controls/component';
import TimeTravelComponent from './time-travel/component';
import CameraControlsComponent from './camera-controls/component';
import LegendComponent from './legend/component';

/**
* @module components/monitor
* This component handles the uploading of algorithm event debug file.
*/
let TopPanelComponent = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#upper-body").append("<div id='top-panel'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#top-panel").html(template);
      this.bindEvents();
    },

    onReady(){
      let components = [MapComponent, DebuggerComponent, PlaybackControlsComponent, BreakpointsComponent, ComparatorComponent, TimeTravelComponent, CameraControlsComponent, LegendComponent];
      components.forEach((component) => {
        component.init();
      });
    },

    bindEvents() {
    }
  }
}));

export default TopPanelComponent;
