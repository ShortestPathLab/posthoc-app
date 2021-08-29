import $ from "jquery";

export default {
  init(el, cb){
    this.el = el;
    this.cb = cb;
    this.mousemoveFn = this.mousemove.bind(this);
    this.mousedownFn = this.mousedown.bind(this);
    this.mouseupFn = this.mouseup.bind(this);
    this.el.on("mousedown", this.mousedownFn);
  },
  mousedown(e){
    $(window).on("mousemove", this.mousemoveFn);
    $(window).on("mouseup", this.mouseupFn);

    this.prevX = e.clientX;
    this.prevY = e.clientY;
  },
  mousemove(e){
    if (!this.el[0].isResizing) {
      let newX = this.prevX - e.clientX;
      let newY = this.prevY - e.clientY;

      const style = this.el[0].style;
      // .log(`prevY=${this.prevY},clientY=${e.clientY},newY=${this.prevY-e.clientY},top=${parseFloat(style.top) - newY}`);

      this.el[0].style.left = parseFloat(style.left) - newX + "px";
      this.el[0].style.top = parseFloat(style.top) - newY + "px";

      this.prevX = e.clientX;
      this.prevY = e.clientY;
      this.cb({top: this.el[0].style.top, left: this.el[0].style.left});
    }
  },
  mouseup(){
    $(window).off("mousemove", this.mousemoveFn);
    $(window).off("mouseup", this.mouseupFn);
  }
};
