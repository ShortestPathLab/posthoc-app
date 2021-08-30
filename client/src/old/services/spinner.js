import {Spinner} from 'spin.js';

export default {
  _spinner: null,
  _target: null,
  _overlay: null,
  options:{
    lines: 14,
    length: 70,
    width: 15,
    radius: 84,
    scale: 1,
    corners: 1,
    speed: 1.3,
    rotate: 0,
    animation: "spinner-line-shrink",
    direction: 1,
    color: "#000000",
    fadeColor: "transparent",
    top: "50%",
    left: "50%",
    shadow: "0 0 1px #cdcdcd"
  },
  get target(){
    if(!this._target){
      this._target = document.getElementById("pathfinder");
    }
    return this._target;
  },
  get overlay(){
    if(!this._overlay){
      this._overlay = document.createElement("div");
      this._overlay.id = "overlay";
      this._overlay.style.display = "none";
      this.target.appendChild(this._overlay);
    }
    return this._overlay;
  },
  get spinner(){
    if(!this._spinner){
      this._spinner = new Spinner(this.options);
    }
    return this._spinner;
  },
  show(){
    this.overlay.style.display = "block";
    this.spinner.spin(this.target);
  },
  hide(){
    this.overlay.style.display = "none";
    this.spinner.stop();
  }
}
