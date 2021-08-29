import StateMachine from "javascript-state-machine";
import $ from "jquery";
import MicroModal from "micromodal";
import BreakpointService from "../../../../../services/breakpoint";
import BaseComponent from "../../../../base-component";
import template from "./template";

let BreakpointsComponent = new StateMachine(
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
        $("#top-panel").append("<div id='breakpoints'></div>");
      },

      /**
       * @function onLeaveNone
       * This function fills the component container with the template file and initiates event binding.
       */
      onLeaveNone() {
        $("#breakpoints").html(template);
        this.hide();
        this.bindEvents();
      },

      onReady() {
        this.addBreakpoint();
      },

      hide() {
        this.shown = false;
        $("#bp-btn").prop("disabled", true);
      },

      show() {
        if (!this.shown) {
          this.shown = true;
          $("#bp-btn").prop("disabled", false);
        }
      },

      addBreakpoint() {
        let htmlStr = `<div class='row'><div class='bp col-sm'><select class='bp-opd'>`;
        const operands = ["id", "x", "y", "f", "g", "h"];
        const operators = ["less than", "equal to", "greater than"];
        const nodeTypes = ["all", "generating", "updating", "expanding"];
        operands.forEach((operand) => {
          htmlStr += `<option>${operand}</option>`;
        });
        htmlStr += `</select></div>`;
        htmlStr += `<div class='col-sm'><select class='bp-opr'>`;
        operators.forEach((operator) => {
          htmlStr += `<option>${operator}</option>`;
        });
        htmlStr += `</select></div>`;
        htmlStr += `<div class='col-sm'><select class='bp-nt'>`;
        nodeTypes.forEach((nodeType) => {
          htmlStr += `<option>${nodeType}</option>`;
        });
        htmlStr += `</select></div>`;
        htmlStr += `<div class='col-sm'><input class='bp-val' type='number'></div>`;
        htmlStr += `<div class='col-sm'><label class="switch"><input class='bp-active' type="checkbox" checked=true><span class="slider round"></span></label></div>`;
        htmlStr += `<div class='col-sm'><a class="remove-bp modal__btn modal__btn-warning">Remove</a></div></div>`;
        $("#bps").append(htmlStr);
        $(".remove-bp").on("click", (e) => {
          $(e.target).closest(".row").remove();
        });
      },

      /**
       * @function bindEvents
       * This function calls the PlaybackService callbacks as per the button clicked
       */
      bindEvents() {
        MicroModal.init();
        let self = this;
        $("#save-bp").on("click", () => {
          self.setValues();
        });
        $("#remove-bp").on("click", () => {
          self.clearValues();
        });
        $("#add-bp a").on("click", () => {
          self.addBreakpoint();
        });
      },

      setValues() {
        let bps = [];
        const totalBps = $("#bps .bp").length;
        let bpOpds = $(".bp-opd");
        let bpOprs = $(".bp-opr");
        let bpNodeTypes = $(".bp-nt");
        let bpVals = $(".bp-val");
        let bpActive = $(".bp-active");
        for (let i = 0; i < totalBps; i++) {
          let operand = bpOpds[i].value;
          let operator = bpOprs[i].value;
          let nodeType = bpNodeTypes[i].value;
          if (nodeType == "all") {
            nodeType = ["expanding", "updating", "generating"];
          } else {
            nodeType = [nodeType];
          }
          let val = bpVals[i].value;
          let active = $(bpActive[i]).is(":checked");
          if (active && val) {
            bps.push({
              operand,
              operator,
              nodeType,
              val,
            });
          }
        }
        // $("#bp-f-active").on("change", () => {
        BreakpointService.monotonicF($("#bp-f-active").is(":checked"));
        // });
        // $("#bp-g-active").on("change", () => {
        BreakpointService.monotonicG($("#bp-g-active").is(":checked"));
        // });
        BreakpointService.setBps(bps);
      },

      clearValues() {
        $("#bps .row").html("");
        this.addBreakpoint();
      },

      check(step) {
        let node = step.node;
        return BreakpointService.check(node);
      },
    },
  })
);

export default BreakpointsComponent;
