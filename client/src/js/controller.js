import StateMachine from "javascript-state-machine";
import $ from "jquery";
import * as Toastr from "toastr";
import Components from "./components";
import EventsListComponent from "./components/body/bottom-body/side-panel/events-list/component";
import DebuggerComponent from "./components/body/upper-body/top-panel/debugger/component";
import MapComponent from "./components/body/upper-body/top-panel/map/component";
import BreakpointService from "./services/breakpoint";
import DragResizeBoxService from "./services/drag-resize-box";
import FloatboxService from "./services/floatbox";
import FrontierService from "./services/frontier";
import HistoryService from "./services/history";
import Injector from "./services/injector";
import mouseTracker from "./services/mouse-tracker";
import NodeStateService from "./services/node-state";
import PlaybackService from "./services/playback";
import PreLoaderService from "./services/pre-loader";
import Renderer from "./services/renderer";
import resizeTracker from "./services/resize-tracker";
import runnerFactory from "./services/runner";
import SearchPathService from "./services/search-path";
import Store from "./services/store";
/**
 * @module controller
 * The controller is the main part which controls the whole app. It is a StateMachine with 3 states: none, ready and running. Init transition changes state from none to ready. Start transition changes state from ready to running.
 */
let Controller = new StateMachine({
  transitions: [
    {
      name: "init",
      from: "none",
      to: "ready",
    },
    {
      name: "start",
      from: "ready",
      to: "running",
    },
  ],

  /**
   * Data of this state machine has keeps all the variables required for functioning.
   */
  data: {
    //runner => The runner is function looper that runs every step of the algorithm serially.
    runner: null,
    //currentId => Id of the current step being run
    currentId: 0,
    //rendered => If the canvas has been rendered on the screen or not.
    rendered: false,
    //app => PIXI.Application object
    app: null,
    //renderer => app.renderer
    renderer: null,
    //stage => app.stage
    stage: null,
    //canvas => DOM element canvas
    canvas: null,

    timeTravelling: false,

    preempt: false,
  },
  methods: {
    onPendingTransition(transition, from, to) {
      // debugger
    },
    onInvalidTransition(transition, from, to) {
      // debugger
    },

    /**
     * @function onInit
     * This function is called when the Controller is initiated(init transition) i.e. none to ready state. It initiates all the components on the page.
     */
    onInit() {
      mouseTracker(this);
      resizeTracker(this);
      Components.forEach((component) => {
        component.init();
      });
      HistoryService.init(this);
      FrontierService.init(this);
      SearchPathService.init(this);
      this.configureToastr();
      this.preloadFiles();
    },

    preloadFiles() {
      PreLoaderService.init(this);
      if (PreLoaderService.preload) {
        let mapPromise = PreLoaderService.loadMap();
        if (mapPromise) {
          mapPromise.then(() => {
            PreLoaderService.loadTrace();
          });
        } else {
          PreLoaderService.loadTrace();
        }
      }
    },
    postLoadMap() {
      this.mapTitle = PreLoaderService.mapTitle;
      if (this.mapTitle) {
        MapComponent.postProcess();
      }
    },
    postLoadTrace() {
      this.traceTitle = PreLoaderService.traceName;
      if (this.traceTitle) {
        DebuggerComponent.postProcess();
      }
    },

    configureToastr() {
      Toastr.options.timeOut = 0; // How long the toast will display without user interaction
      Toastr.options.extendedTimeOut = 30; // How long the toast will display after a user hovers over it
      Toastr.options.closeButton = true;
      Toastr.options.preventDuplicates = true; // show only one toastr at a time
      Toastr.options.positionClass = "toast-top-center"; //position of toastr
    },

    /**
     * @function onReady
     * This function is called when the Controller has entered ready state by init transition. It setup play and reset callback in playback service with Controller context.
     */
    onReady() {
      PlaybackService.addCallback("play", this.loop.bind(this));
      PlaybackService.addCallback("reset", this.reset.bind(this));
      PlaybackService.addCallback("pause", this.pause.bind(this));
      FloatboxService.addCallback("show", this.showFloatbox.bind(this));
      FloatboxService.addCallback("hide", this.hideFloatbox.bind(this));
    },

    /**
     * @function onStart
     * This function is called when Controller is started(start transition) i.e. ready to running state. It is basically called when the algorithm is uploaded and app can be in running state. It calculates total steps in the algorithm, setups runner and initiates Playback and Floatbox services.
     */
    onStart() {
      this.tracer = Store.find("Tracer");
      let that = this;
      this.tracer.steps.then((steps) => {
        if (this.tracer.stateStructure) {
          NodeStateService.init(this.tracer.stateStructure);
        }
        this.steps = steps;
        that.setupRenderer();
        this.totalSteps = Object.keys(this.steps).length;
        that.runner = runnerFactory.call(that, steps);
        PlaybackService.init();
        FloatboxService.init();
      });
    },

    getMap() {
      let map = Store.find("Map");
      if (map && map.mapType == "grid") {
        map = Store.find("Grid");
      } else if (map && map.mapType == "mesh") {
        map = Store.find("Mesh");
      } else if (map && map.mapType == "roadnetwork") {
        map = Store.find("RoadNetwork");
      }
      return map;
    },

    getDimensions() {
      let width, height;
      let map = this.getMap();
      if (map) {
        this.map = map;
        width = map.width;
        height = map.height;
      } else {
        width = this.tracer.width;
        height = this.tracer.height;
      }
      return { width, height };
    },

    /**
     * @function setupRenderer
     * This function initiates the canvas by map's height and width if it is uploaded. Otherwise, just algorithm's max width and height used. Renderer service is used to render.
     */
    setupRenderer() {
      if (!this.rendered) {
        let { width, height } = this.getDimensions();
        let screen = $("#screen");
        let screenHeading = $("#screen-heading");
        width = screen.width();
        height = screen.height() - screenHeading.outerHeight();
        Renderer.render(this, width, height);
      }
    },

    fitMap() {
      let { width, height } = this.getDimensions();
      Renderer.fitMap(this, width, height);
      DragResizeBoxService.setDefaultAttrs();
    },

    fitScale() {
      Renderer.fitScale(this);
      DragResizeBoxService.setDefaultAttrs();
    },

    fitDebugger() {
      let tracer = this.tracer;
      Renderer.fitDebugger(
        this,
        tracer.minY,
        tracer.maxY,
        tracer.minX,
        tracer.maxX
      );
      DragResizeBoxService.setDefaultAttrs();
    },

    /**
     * @function loop
     * This function is called by playback play control and keeps stepping forward unless paused or stopped.
     */
    loop() {
      let self = this;
      (function loop() {
        if (!PlaybackService.is("running")) {
          return;
        }
        self.stepForward();
        if (self.tracer.stateStructure) {
          setTimeout(loop, 500);
        } else {
          window.requestAnimationFrame(loop);
        }
      })();
    },

    executeFloatbox() {
      const position = {
        x: this.x,
        y: this.y,
      };
      FloatboxService.execute(
        this.tracer.inspectedNodeObject.node.values,
        position
      );
    },

    showFloatbox() {},

    hideFloatbox() {
      this.tracer.inspectedNodeObject = null;
    },

    /**
     * @function retraceHistory
     * This function removes everything from canvas. Draws all the objects from the history. Also draws the line.
     * @param {number} id - id of the step at which algorithm is to be retraced.
     */
    retraceHistory(id) {
      this.historyRetraced = true;
      this.cleanCanvas();
      HistoryService.retraceHistory(id);
      FrontierService.retraceHistory(id);
      SearchPathService.retraceHistory(id);
    },

    /**
     * @function clearFutureData
     * This function clears all the data by limiting rectangles, frontierHistory and lines history with currentId.
     */
    clearFutureData() {
      if (this.historyRetraced) {
        SearchPathService.clearFuture();
        HistoryService.clearFuture();
        FrontierService.clearFuture();
        EventsListComponent.clearEvents(this.currentId);
        this.historyRetraced = false;
      }
    },

    /**
     * @function stepForward
     * This function calls runner to draw the current step and also add step text.
     */
    stepForward(suppress = false) {
      if (this.preempt) {
        return;
      }
      this.clearFutureData();
      if (
        this.currentId > this.totalSteps &&
        PlaybackService.state != "paused"
      ) {
        PlaybackService.pause();
        return;
      }
      let currentStep = this.steps[this.currentId];
      this.runner();
      EventsListComponent.addEvent(currentStep);
      // EventsListComponent.highlightNodes();
      if (!this.timeTravelling) {
        let bpMsg = BreakpointService.check(currentStep.node);
        if (bpMsg) {
          this.preempt = true;
          if (!suppress) {
            Toastr.remove();
            Toastr.error(bpMsg);
          }
          setTimeout(() => {
            if (
              this.currentId <= this.totalSteps &&
              PlaybackService.state != "paused"
            ) {
              PlaybackService.pause();
            }
            this.preempt = false;
          }, 0);
        }
      }
    },

    /**
     * @function cleanCanvas
     * This function removes all the rectangles from history, frontierRects and lines from the canvas.
     */
    cleanCanvas() {
      HistoryService.clean();
      FrontierService.clean();
      SearchPathService.clean();
    },

    /**
     * @function pause
     * This function is called when PLayback Service is paused. It reshuffles the children
     */
    pause() {
      // this.stage.children.sort(function(a,b) {
      //   a.zIndex = a.zIndex || 0;
      //   b.zIndex = b.zIndex || 0;
      //   return b.zIndex - a.zIndex
      // });
    },

    /**
     * @function reset
     * This function resets everything to the start.
     */
    reset() {
      this.cleanCanvas();
      HistoryService.reset();
      FrontierService.reset();
      EventsListComponent.clearEvents(this.currentId);
    },

    /**
     * @function stepBackward
     * This function decrements the current id. It removes the current rectangle. It removes the new frontier rectanges if added in current step or retraces the frontier rectangles that were in the previous step. It also removes the current line and adds the previous line. It also removes the current even text from the list.
     */
    stepBackward() {
      this.clearFutureData();
      if (this.currentId == 0) {
        return;
      }
      HistoryService.stepBackward();
      FrontierService.stepBackward();
      SearchPathService.stepBackward();
      EventsListComponent.removeEvent();
      this.currentId -= 1;
      // EventsListComponent.highlightNodes();
    },
  },
});
Injector.register("controller", Controller);

window.controller = Controller;
export default Controller;
