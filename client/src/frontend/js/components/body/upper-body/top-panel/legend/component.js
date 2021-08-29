import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../../../../base-component';
import config from '../../../../../config';

let LegendComponent = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#top-panel").append("<div id='legend'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#legend").html(template);
      this.setupLegends();
      this.hide();
      this.bindEvents();
    },

    hide(){
      // $("#legend").hide();
    },

    show(){
      // $("#legend").show();
    },

    setupLegends(){
      let items = [
        {type: "source", title: "Source", color: config.nodeAttrs.source},
        {type: "destination", title: "Destination", color: config.nodeAttrs.destination},
        {type: "opened", title: "Open", color: config.nodeAttrs.opened},
        {type: "closing", title: "Closed", color: config.nodeAttrs.closed},
        {type: "expanding", title: "Expanding (Current)", color: config.nodeAttrs.current},
        {type: "frontier", title: "Frontier (Generating/Updating)", color: config.nodeAttrs.frontier}
      ];
      let legend = document.getElementById("legend");
      items.forEach((item) => {
        let legendItem = document.createElement("div");
        legendItem.className = "legend-item";
        let colorBox = document.createElement("div");
        colorBox.className = "color-box";
        let colorTitle = document.createElement("div");
        colorTitle.className = "color-title";
        colorBox.style.background = "#" + item.color.fillColor.toString(16).padStart(6, '0');
        // colorBox.style.borderColor = "#" + item.color.lightColor.toString(16);
        colorTitle.innerHTML = item.title;
        legendItem.appendChild(colorBox);
        legendItem.appendChild(colorTitle);
        legend.appendChild(legendItem);
      });
    },

    bindEvents() {
    }
  }
}));

export default LegendComponent;
