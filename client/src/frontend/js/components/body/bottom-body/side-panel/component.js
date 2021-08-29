import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../../../base-component';

import EventsListComponent from './events-list/component';

/**
* @module components/monitor
* This component handles the uploading of algorithm event debug file.
*/
let SidePanelComponent = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#bottom-body").append("<div id='side-panel'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#side-panel").html(template);
      this.bindEvents();
    },

    onReady(){
      EventsListComponent.init();
    },

    bindEvents() {
    }
  }
}));

export default SidePanelComponent;
