import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../../../base-component';
import ScreenComponent from './screen/component';

/**
* @module components/monitor
* This component handles the uploading of algorithm event debug file.
*/
let MainPanelComponent = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#bottom-body").append("<div id='main-panel'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#main-panel").html(template);
      this.bindEvents();
    },

    onReady(){
      ScreenComponent.init();
    },

    bindEvents() {
    }
  }
}));

export default MainPanelComponent;
