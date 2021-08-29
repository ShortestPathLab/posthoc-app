import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../../base-component';

import MainPanelComponent from './main-panel/component';
import SidePanelComponent from './side-panel/component';

/**
* @module components/monitor
* This component handles the uploading of algorithm event debug file.
*/
let BottomBody = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#body").append("<div id='bottom-body'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#bottom-body").html(template);
      this.bindEvents();
    },

    onReady(){
      let components = [MainPanelComponent, SidePanelComponent];
      components.forEach((component) => {
        component.init();
      });
    },

    bindEvents() {
    }
  }
}));

export default BottomBody;
