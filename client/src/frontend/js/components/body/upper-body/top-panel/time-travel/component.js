import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import MicroModal from 'micromodal';

import BaseComponent from '../../../../base-component';
import Controller from '../../../../../controller';
import TimeTravelService from '../../../../../services/time-travel';
import EventsListComponent from '../../../bottom-body/side-panel/events-list/component';
import Spinner from '../../../../../services/spinner';

/**
 * @module components/playback-controls
 * This component handles the playback controls buttons.
 */
let TimeTravelComponent = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
     * @function onBeforeInit
     * This function creates component div container and appends it to the page.
     */
    onBeforeInit() {
      $("#top-panel").append("<div id='time-travel'></div>");
    },

    /**
     * @function onLeaveNone
     * This function fills the component container with the template file and initiates event binding.
     */
    onLeaveNone() {
      $("#time-travel").html(template);
      this.hide();
      this.bindEvents();
    },

    hide() {
      this.shown = false;
      $("#tt-btn").prop('disabled', true);
    },

    show() {
      if (!this.shown) {
        this.shown = true;
        $("#tt-btn").prop('disabled', false);
      }
    },

    /**
     * @function bindEvents
     * This function calls the PlaybackService callbacks as per the button clicked
     */
    bindEvents() {
      MicroModal.init();
      $("#travel-jump").on('click', (e) => {
        Spinner.show();
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              let jumpVal = $('#travel-jump-input').val();
              TimeTravelService.jump(Controller, parseInt(jumpVal));
              EventsListComponent.highlightNodes();
            } finally {
              resolve();
            }
          }, 200);
        });
        promise.then(() => {
          Spinner.hide();
        });
      });
      $("#travel-event-backward").on('click', (e) => {
        Spinner.show();
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              let backVal = $('#travel-event-input').val();
              TimeTravelService.goEventBackwards(Controller, parseInt(backVal));
              EventsListComponent.highlightNodes();
            } finally {
              resolve();
            }
          }, 200);
        });
        promise.then(() => {
          Spinner.hide();
        });
      });
      $("#travel-event-forward").on('click', (e) => {
        Spinner.show();
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              let frontVal = $('#travel-event-input').val();
              TimeTravelService.goEventForwards(Controller, parseInt(frontVal));
              EventsListComponent.highlightNodes();
            } finally {
              resolve();
            }
          }, 200);
        });
        promise.then(() => {
          Spinner.hide();
        });
      });
      $("#travel-expansion-backward").on('click', (e) => {
        Spinner.show();
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              let backVal = $('#travel-expansion-input').val();
              TimeTravelService.goExpansionBackwards(Controller, parseInt(backVal));
              EventsListComponent.highlightNodes();
            } finally {
              resolve();
            }
          }, 200);
        });
        promise.then(() => {
          Spinner.hide();
        });
      });
      $("#travel-expansion-forward").on('click', (e) => {
        Spinner.show();
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              let frontVal = $('#travel-expansion-input').val();
              TimeTravelService.goExpansionForwards(Controller, parseInt(frontVal));
              EventsListComponent.highlightNodes();
            } finally {
              resolve();
            }
          }, 200);
        });
        promise.then(() => {
          Spinner.hide();
        });
      });
      $("#go-tt").on('click', (e) => {
        Spinner.show();
        let promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              let input = $("#tt-input").val();
              let type = $("#tt-type").val();
              let direction = $("#tt-direction").val();
              TimeTravelService.travel(Controller, type, direction, parseInt(input));
              EventsListComponent.highlightNodes();
            } finally {
              resolve();
            }
          }, 200);
        });
        promise.then(() => {
          Spinner.hide();
        });
      });
    }
  }
}));

export default TimeTravelComponent;
