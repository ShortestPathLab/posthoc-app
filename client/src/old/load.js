import "../styles/app.scss";
import "../styles/vendor.scss";
import Controller from "./controller";

export default () =>
  new Promise((res) => {
    document.addEventListener("DOMContentLoaded", () => {
      Controller.init();
      res();
    });
  });
