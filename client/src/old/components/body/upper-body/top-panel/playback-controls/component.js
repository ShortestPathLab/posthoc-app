import StateMachine from "javascript-state-machine";

import template from './template'
import $ from 'jquery';
import BaseComponent from '../../../../base-component';
import Controller from '../../../../../controller';
import PlaybackService from '../../../../../services/playback';

/**
* @module components/playback-controls
* This component handles the playback controls buttons.
*/
let PlaybackControlsComponent = new StateMachine($.extend({}, BaseComponent, {
  methods: {
    /**
    * @function onBeforeInit
    * This function creates component div container and appends it to the page.
    */
    onBeforeInit() {
      $("#top-panel").append("<div id='playback-controls'></div>");
    },

    /**
    * @function onLeaveNone
    * This function fills the component container with the template file and initiates event binding.
    */
    onLeaveNone() {
      $("#playback-controls").html(template);
      this.hideAll();
      this.bindCallbacks();
      this.bindEvents();
    },

    /**
    * @function bindCallbacks
    * This function add the playback functions to playback callback service.
    */
    bindCallbacks() {
      PlaybackService.addCallback('init', this.reset.bind(this));
      PlaybackService.addCallback('play', this.play.bind(this));
      PlaybackService.addCallback('pause', this.pause.bind(this));
      PlaybackService.addCallback('reset', this.reset.bind(this));
    },

    /**
    * @function bindEvents
    * This function calls the PlaybackService callbacks as per the button clicked
    */
    bindEvents() {
      $("#play").on('click', (e) => {
        PlaybackService.play();
      });
      $("#pause").on('click', (e) => {
        PlaybackService.pause();
      });
      $("#stop").on('click', (e) => {
        PlaybackService.reset();
      });
      $("#step-forward").on('click', (e) => {
        Controller.stepForward();
      });
      $("#step-backward").on('click', (e) => {
        Controller.stepBackward();
      });
    },

    /**
    * @function hideAll
    * This function hides all the buttons
    */
    hideAll(){
      $('#play').prop('disabled', true);
      $('#step-forward').prop('disabled', true);
      $('#step-backward').prop('disabled', true);
      $('#pause').prop('disabled', true);
      $('#stop').prop('disabled', true);
    },

    /**
    * @function play
    * This function shows only pause and stop button
    */
    play(){
      $('#play').prop('disabled', true);
      $('#step-forward').prop('disabled', true);
      $('#step-backward').prop('disabled', true);
      $('#pause').prop('disabled', false);
      $('#stop').prop('disabled', false);
    },

    /**
    * @function pause
    * This function shows play, step and stop button
    */
    pause(){
      $('#play').prop('disabled', false);
      $('#step-forward').prop('disabled', false);
      $('#step-backward').prop('disabled', false);
      $('#pause').prop('disabled', true);
      $('#stop').prop('disabled', false);
    },

    /**
    * @function reset
    * This function shows play and step buttons
    */
    reset(){
      $('#play').prop('disabled', false);
      $('#step-forward').prop('disabled', false);
      $('#step-backward').prop('disabled', false);
      $('#pause').prop('disabled', true);
      $('#stop').prop('disabled', true);
    }
  }
}));

export default PlaybackControlsComponent;
