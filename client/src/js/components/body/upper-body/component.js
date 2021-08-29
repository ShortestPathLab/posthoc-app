import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../../base-component';

import TopPanelComponent from './top-panel/component';

/**
* @module components/monitor
* This component handles the uploading of algorithm event debug file.
*/
let UpperBody = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#body").append("<div id='upper-body'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#upper-body").html(template);
      this.bindEvents();
    },

    onReady(){
      TopPanelComponent.init();
    },

    bindEvents() {
    }
  }
}));

export default UpperBody;
