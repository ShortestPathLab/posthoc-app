import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../base-component';

/**
* @module components/monitor
* This component handles the uploading of algorithm event debug file.
*/
let HeaderComponent = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#pathfinder").append("<div id='header'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#header").html(template);
      this.bindEvents();
    },

    onReady(){
    },

    bindEvents() {
    }
  }
}));

export default HeaderComponent;
