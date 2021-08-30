import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../base-component';

import UpperBody from './upper-body/component';
import BottomBody from './bottom-body/component';

/**
* @module components/monitor
* This component handles the uploading of algorithm event debug file.
*/
let Body = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#pathfinder").append("<div id='body'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#body").html(template);
      this.bindEvents();
    },

    onReady(){
      let components = [UpperBody, BottomBody];
      components.forEach((component) => {
        component.init();
      });
    },

    bindEvents() {
    }
  }
}));

export default Body;
