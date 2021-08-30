import StateMachine from "javascript-state-machine";

import template from "./template";
import $ from "jquery";
import BaseComponent from "../../../../base-component";
import LoggerOverlayComponent from "../logger-overlay/component";
import PlaybackService from "../../../../../services/playback";
import Store from "../../../../../services/store";
import nodeColor from "../../../../../utils/node-color";
import TimeTravelService from "../../../../../services/time-travel";

import Controller from "../../../../../controller";
import config from "../../../../../config";

/**
 * @module components/events-list
 * This component handles the display of events of algorithms on the panel
 */
let EventsListComponent = new StateMachine(
  $.extend({}, BaseComponent, {
    data: {
      events: [],
    },
    methods: {
      /**
       * @function onBeforeInit
       * This function creates component div container and appends it to the page.
       */
      onBeforeInit() {
        $("#side-panel").append("<div id='events-list'></div>");
      },

      onReady() {
        LoggerOverlayComponent.init();
      },

      /**
       * @function onLeaveNone
       * This function fills the component container with the template file, initiates event binding and callback binding.
       */
      onLeaveNone() {
        $("#events-list").html(template);
        this.bindCallbacks();
        this.bindEvents();
      },

      /**
       * @function bindCallbacks
       * This function add the playback functions to playback callback service.
       */
      bindCallbacks() {
        PlaybackService.addCallback("init", this.reset.bind(this));
        PlaybackService.addCallback("play", this.play.bind(this));
        PlaybackService.addCallback("pause", this.pause.bind(this));
        PlaybackService.addCallback("reset", this.reset.bind(this));
      },

      bindEvents() {},

      /**
       * @function play
       * This function hides the event list when algorithm is running.
       */
      play() {
        $("#events").hide();
        LoggerOverlayComponent.play();
      },

      /**
       * @function pause
       * This function shows the event list when algorithm is paused.
       */
      pause() {
        $("#events").show();
        this.scrollToCurrentEvent();
        LoggerOverlayComponent.pause();
        this.highlightNodes();
      },

      scrollToCurrentEvent() {
        // if(this.events.length){
        //   let stepId = this.events[this.events.length - 1];
        //   let el;
        //   if (stepId > 5) {
        //     el = document.getElementById(`event-${stepId-5}`);
        //   } else {
        //     el = document.getElementById(`event-${stepId}`);
        //   }
        //   el.scrollIntoView();
        // }
      },

      clearHighlighting() {
        this.highlightedEvents.forEach((li) => {
          let rgba = `rgba(${li.dataset.r},${li.dataset.g},${li.dataset.b},0.5)`;
          li.style.background = rgba;
          delete li.dataset.highlight;
          li.style.removeProperty("font-weight");
        });
        this.highlightedEvents = [];
      },

      highlightNodes() {
        this.clearHighlighting();
        if (this.events.length == 0) {
          return;
        }
        let currentStepId = this.events[this.events.length - 1];
        let currentStep = Store.findById("Step", currentStepId);
        let currentNode = currentStep.node;
        let siblingNodes = currentNode.siblingNodes;
        let parentNode = currentNode.parentNode;
        if (parentNode) {
          this.highlight(parentNode.step._id);
        }
        this.highlight(currentNode.step._id);
        if (currentNode.step.isFrontier) {
          let hex = config.nodeAttrs.frontier.fillColor
            .toString(16)
            .padStart(6, "0");
          let rgba = `rgba(${("0x" + hex[0] + hex[1]) | 0},${
            ("0x" + hex[2] + hex[3]) | 0
          },${("0x" + hex[4] + hex[5]) | 0},1)`;
          this.highlight(currentNode.step._id, rgba);
          siblingNodes.forEach((node) => {
            if (node.step._id < currentNode.step._id) {
              this.highlight(node.step._id, rgba);
            }
          });
        }
      },

      highlight(stepId, rgba = null) {
        if (stepId > this.events.length) {
          return;
        }
        let li = document.getElementById(`event-${stepId}`);
        if (!li) {
          return;
        }
        if (!rgba) {
          rgba = `rgba(${li.dataset.r},${li.dataset.g},${li.dataset.b},1)`;
        }
        li.dataset.highlight = "1";
        li.style.background = rgba;
        li.style.fontWeight = "bold";
        this.highlightedEvents.push(li);
      },

      /**
       * @function reset
       * This function hides the event list when algorithm is stopped.
       */
      reset() {
        this.highlightedEvents = [];
        let tracer = Store.find("Tracer");
        tracer.eventsListHtml.then((eventsListHtml) => {
          $("#events").html(eventsListHtml);
          $(".event").on("click", (e) => {
            TimeTravelService.goToEvent(Controller, e.target.dataset.id);
            // Controller.retraceHistory(e.target.dataset.id);
          });
        });
        LoggerOverlayComponent.reset();
      },

      /**
       * @function addEvent
       * This function add li element with the event details passed to it. It also binds retrace history upon clicking on the event.
       * @param {Object} event - It has _id, text
       */
      addEvent(step) {
        if (step) {
          this.events.push(step._id);
          let hex = config.nodeAttrs[nodeColor[step.type]].fillColor
            .toString(16)
            .padStart(6, "0");
          let r = ("0x" + hex[0] + hex[1]) | 0;
          let g = ("0x" + hex[2] + hex[3]) | 0;
          let b = ("0x" + hex[4] + hex[5]) | 0;
          let a = 0.5;
          let rgba = `rgba(${r},${g},${b},${a})`;
          let el = $(`#event-${step._id}`);
          el.css("background", rgba);
          el.attr("data-r", r);
          el.attr("data-g", g);
          el.attr("data-b", b);
          el.attr("data-a", a);
          this.highlightNodes();
          this.scrollToCurrentEvent();
          LoggerOverlayComponent.setNode(step.node);
        }
      },

      /**
       * @function removeEvent
       * This function removes the last event from the list and screen.
       */
      removeEvent() {
        let eventId = this.events.pop();
        // if(!eventId){
        //   return;
        // }
        let li = document.getElementById(`event-${eventId}`);
        li.style.removeProperty("background");
        delete li.dataset.r;
        delete li.dataset.g;
        delete li.dataset.b;
        delete li.dataset.a;
        this.highlightNodes();
        this.scrollToCurrentEvent();
        if (this.events.length == 0) {
          return;
        }
        let stepId = this.events[this.events.length - 1];
        let step = Store.findById("Step", stepId);
        LoggerOverlayComponent.setNode(step.node);
      },

      /**
       * @function clearEvents
       * This function clear all the events up to the id passed.
       * @param {number} id
       */
      clearEvents(id) {
        let pruneLength = this.events.length - id;
        let pruneEvents = $("#events .event").slice(-pruneLength);
        pruneEvents.remove();
        this.events.length = id;
        let stepId = this.events[this.events.length - 1];
        let step = Store.findById("Step", stepId);
        LoggerOverlayComponent.setNode(step.node);
      },
    },
  })
);
window.comp = EventsListComponent;
export default EventsListComponent;
