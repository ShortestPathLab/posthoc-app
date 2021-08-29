let template = () => `
  <div class="btn-with-title">
    <button id='fit-map' title='Fit Map'><img class='desktop-icon' src="icons/desktop.svg" type="image/svg+xml" /><img class='map-icon' src="icons/map.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Fit Map</span>
  </div>
  <div class="btn-with-title">
    <button id='fit-debugger' title='Fit Algorithm'><img class='desktop-icon' src="icons/desktop.svg" type="image/svg+xml" /><img class='terminal-icon' src="icons/terminal.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Fit Trace</span>
  </div>
  <div class="btn-with-title">
    <button id='fit-scale' title='Fit Scale'><img class='desktop-icon' src="icons/desktop.svg" type="image/svg+xml" /><img class='arrows-alt-icon' src="icons/arrows-alt.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Fit Scale</span>
  </div>
`;
export default template;
