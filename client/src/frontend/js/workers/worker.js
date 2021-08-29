onmessage = function(evt) {
  importScripts(evt.data.scriptUrl);
  postMessage(main(evt.data.params));
};
