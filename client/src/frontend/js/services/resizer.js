import $ from "jquery";

export default {
  dirs: ["ne", "nw", "se", "sw"],
  resizers: [],
  init(el, cb){
    this.el = el;
    this.cb = cb;
    this.mousemoveFn = this.mousemove.bind(this);
    this.mousedownFn = this.mousedown.bind(this);
    this.mouseupFn = this.mouseup.bind(this);
    this.dirs.forEach((dir) => {
      let reEl = document.createElement('div');
      reEl.classList.add("resizer", dir)
      this.el.append(reEl);
      this.resizers.push(reEl);
    });
    for (let resizer of this.resizers) {
      $(resizer).on("mousedown", this.mousedownFn);
    }
  },
  mousemove(e){
    const rect = this.el[0].getBoundingClientRect();
    let currentResizer = this.currentResizer;

    if (currentResizer.classList.contains("se")) {
      this.el[0].style.width = rect.width - (this.prevX - e.clientX) + "px";
      this.el[0].style.height = rect.height - (this.prevY - e.clientY) + "px";
    } else if (currentResizer.classList.contains("sw")) {
      this.el[0].style.width = rect.width + (this.prevX - e.clientX) + "px";
      this.el[0].style.height = rect.height - (this.prevY - e.clientY) + "px";
      this.el[0].style.left = rect.left - (this.prevX - e.clientX) + "px";
    } else if (currentResizer.classList.contains("ne")) {
      this.el[0].style.width = rect.width - (this.prevX - e.clientX) + "px";
      this.el[0].style.height = rect.height + (this.prevY - e.clientY) + "px";
      this.el[0].style.top = rect.top - (this.prevY - e.clientY) + "px";
    } else {
      this.el[0].style.width = rect.width + (this.prevX - e.clientX) + "px";
      this.el[0].style.height = rect.height + (this.prevY - e.clientY) + "px";
      this.el[0].style.top = rect.top - (this.prevY - e.clientY) + "px";
      this.el[0].style.left = rect.left - (this.prevX - e.clientX) + "px";
    }
    this.prevX = e.clientX;
    this.prevY = e.clientY;
    this.cb({width: this.el[0].style.width, height: this.el[0].style.height, top: this.el[0].style.top, left: this.el[0].style.left});
  },
  mouseup(){
    $(window).off("mousemove", this.mousemoveFn);
    $(window).off("mouseup", this.mouseupFn);
    this.el[0].isResizing = false;
  },
  mousedown(e){
    this.currentResizer = e.target;
    this.el[0].isResizing = true;
    this.prevX = e.clientX;
    this.prevY = e.clientY;

    $(window).on("mousemove", this.mousemoveFn);
    $(window).on("mouseup", this.mouseupFn);
  }
}
