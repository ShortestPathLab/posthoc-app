import StateMachine from "javascript-state-machine";
import $ from "jquery";
import config from "../../../../../config";
import Controller from "../../../../../controller";
import GridService from "../../../../../services/grid";
import MeshService from "../../../../../services/mesh";
import RoadNetworkService from "../../../../../services/road-network";
import Spinner from "../../../../../services/spinner";
import Store from "../../../../../services/store";
import BaseComponent from "../../../../base-component";
import ScreenComponent from "../../../bottom-body/main-panel/screen/component";
import CameraControlsComponent from "../camera-controls/component";
import template from "./template";

/**
 * @module components/map
 * This component handles the uploading of map file.
 */
let MapComponent = new StateMachine(
  $.extend({}, BaseComponent, {
    methods: {
      /**
       * @function onBeforeInit
       * This function creates component div container and appends it to the page.
       */
      onBeforeInit() {
        $("#top-panel").append("<div id='map'></div>");
      },

      /**
       * @function onLeaveNone
       * This function fills the component container with the template file and initiates event binding.
       */
      onLeaveNone() {
        $("#map").html(template);
        this.bindEvents();
      },

      /**
       * @function bindEvents
       * This function creates map record from the map fil and hides map upload. It then draws the map on the screen.
       */
      bindEvents() {
        let self = this;
        $("#map-input").on("change", (e) => {
          Spinner.show();
          if (this.validateFiles(e.target.files)) {
            this.processFiles(e.target.files);
          } else {
            Spinner.hide();
            alert("Invalid format(s)");
          }
        });
        $("#map-label").on("click", (e) => {
          if (self.mapLoaded) {
            if (
              window.confirm(
                "Changing Map would reset the current state. Do you want to do that?"
              )
            ) {
              window.location = "app";
            }
            e.preventDefault();
            return false;
          }
        });
      },

      processFiles(files) {
        if (files.length > 1) {
          let file1 = files[0];
          let file2 = files[1];
          let file1Name = file1.name.split(".");
          let file2Name = file2.name.split(".");
          let file1Type = file1Name.pop();
          file1Name = file1Name.join("");
          let file2Type = file2Name.pop();
          file2Name = file2Name.join("");
          let fileType = "roadnetwork";
          let fileName = file1Type == "gr" ? file1Name : file2Name;
          let coFile = file1Type == "co" ? file1 : file2;
          let grFile = file1Type == "gr" ? file1 : file2;
          let map = Store.createRecord("Map", { fileType, fileName });
          Store.createRecord("RoadNetwork", { coFile, grFile });
          config.mapType = "roadnetwork";
          this.fileName = `${file1Name} (roadnetwork)`;
          let roadNetworkPromise = RoadNetworkService.process();
          roadNetworkPromise.finally(() => {
            Spinner.hide();
          });
        } else {
          let file = files[0];
          let fileName = file.name.split(".");
          let fileType = fileName.pop();
          fileName = fileName.join("");
          let map = Store.createRecord("Map", { fileType, fileName });
          if (fileType == "grid") {
            Store.createRecord("Grid", file);
            config.mapType = "grid";
            let gridPromise = GridService.process();
            gridPromise.finally(() => {
              Spinner.hide();
            });
          } else if (fileType == "mesh") {
            Store.createRecord("Mesh", file);
            config.mapType = "mesh";
            let meshPromise = MeshService.process();
            meshPromise.finally(() => {
              Spinner.hide();
            });
          }
          Controller.mapTitle = `${fileName} (${fileType})`;
        }
        this.postProcess();
      },

      postProcess() {
        // $("#map").html(`<div id='map-label'>${Controller.mapTitle}</div>`);
        $("#map-label span").html(" Update Operating Environment");
        CameraControlsComponent.showMapControl();
        CameraControlsComponent.showScaleControl();
        this.mapLoaded = true;
        ScreenComponent.updateLabel();
      },

      validateFiles(files) {
        if (files.length > 1) {
          let file1 = files[0];
          let file2 = files[1];
          let file1Type = file1.name.split(".").pop();
          let file2Type = file2.name.split(".").pop();
          let hasCo = false;
          let hasGr = false;
          if (file1Type == "co" || file2Type == "co") {
            hasCo = true;
          }
          if (file1Type == "gr" || file2Type == "gr") {
            hasGr = true;
          }
          if (hasCo && hasGr) {
            return true;
          } else {
            return false;
          }
        } else {
          let file = files[0];
          let fileType = file.name.split(".").pop();
          if (fileType == "co" || fileType == "gr") {
            return false;
          }
          return true;
        }
      },
    },
  })
);

export default MapComponent;

/*
let photo = document.getElementById("image-file").files[0];
let formData = new FormData();

formData.append("photo", photo);
fetch('/upload/image', {method: "POST", body: formData});
*/
