import StateMachine from "javascript-state-machine";

import template from "./template";

import $ from "jquery";
import MicroModal from "micromodal";

import tracerParser from "../../../../../utils/tracer-parser";

import BaseComponent from "../../../../base-component";
import Controller from "../../../../../controller";
import Store from "../../../../../services/Store.new";
import BreakpointService from "../../../../../services/breakpoint";

/**
 * @module components/playback-controls
 * This component handles the playback controls buttons.
 */
let ComparatorComponent = new StateMachine(
  $.extend({}, BaseComponent, {
    data: {
      bpApplied: false,
      bps: [],
      shown: false,
    },
    methods: {
      /**
       * @function onBeforeInit
       * This function creates component div container and appends it to the page.
       */
      onBeforeInit() {
        $("#top-panel").append("<div id='comparator'></div>");
      },

      /**
       * @function onLeaveNone
       * This function fills the component container with the template file and initiates event binding.
       */
      onLeaveNone() {
        $("#comparator").html(template);
        this.hide();
        this.bindEvents();
      },

      hide() {
        this.shown = false;
        $("#cp-btn").prop("disabled", true);
      },

      show() {
        if (!this.shown) {
          this.shown = true;
          $("#cp-btn").prop("disabled", false);
        }
      },

      /**
       * @function bindEvents
       * This function calls the PlaybackService callbacks as per the button clicked
       */
      //TODO: add comparison for type: expanding only!
      bindEvents() {
        MicroModal.init();
        let self = this;
        let debugFile;
        $("#faulty-trace-input").on("change", (e) => {
          debugFile = e.target.files[0];
          let fileName = debugFile.name.split(".")[0];
          $("#faulty-trace").html(
            `<div id='faulty-trace-label'>Correct Reference Trace: ${fileName}</div>`
          );
          debugFile = debugFile;
        });
        $("#run-cp").on("click", () => {
          let errorNodes = {};
          new Promise((resolve, reject) => {
            tracerParser(debugFile, resolve);
          }).then((debugJson) => {
            debugJson.eventList.forEach((event) => {
              let variables = event.variables;
              variables["type"] = event.type;
              let matchedNode = Store.findBy("Node", variables);
              if (matchedNode && matchedNode.g != event.g) {
                errorNodes[matchedNode._id] = event.g;
              }
            });
            for (let nodeId in errorNodes) {
              let incorrectValue = errorNodes[nodeId];
              let node = Store.getById("Node", nodeId);
              let liStr = `<li>EventId: ${node._id}, NodeId: ${node.id}, Type: ${node.type}, `;
              for (let variableKey in node.variables) {
                liStr += `${variableKey}: ${node.variables[variableKey]}, `;
              }
              liStr += `Original G value: ${node.g}, Incorrect G value: ${incorrectValue}</li>`;
              $("#cp-bps ol").append(liStr);
            }

            BreakpointService.setComparatorNodes(errorNodes);
          });
        });

        $("#cancel-cp").on("click", () => {
          // BreakpointService.comparatorNodes = {};
          // $("#faulty-trace").html(`<label id="faulty-trace-label" for="faulty-trace-input"><i class="fa fa-terminal"></i> Upload Trace</label><input type = 'file' id='faulty-trace-input' accept='.json' />`);
          // $("#cp-bps ol").html("");
        });
      },
    },
  })
);

export default ComparatorComponent;
