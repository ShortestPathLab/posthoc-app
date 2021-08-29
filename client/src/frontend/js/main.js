import "../styles/app.scss";
import "../styles/vendor.scss";

// import '@fortawesome/fontawesome-free/js/all'

import Controller from "./controller";

document.addEventListener("DOMContentLoaded", init, false);
function init() {
  Controller.init();
}
