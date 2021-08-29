let template = () => `
  <div class="btn-with-title">
    <button id='play' title='Play'><img class='play-icon' src="icons/play.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Play</span>
  </div>
  <div class="btn-with-title">
    <button id='pause' title='Pause'><img class='pause-icon' src="icons/pause.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Pause</span>
  </div>
  <div class="btn-with-title">
    <button id='step-backward' title='Step Back'><img class='undo-icon' src="icons/undo.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Step Back</span>
  </div>
  <div class="btn-with-title">
    <button id='step-forward' title='Step Forward'><img class='redo-icon' src="icons/redo.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Step Forward</span>
  </div>
  <div class="btn-with-title">
    <button id='stop' title='Restart'><img class='stop-icon' src="icons/refresh.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Restart</span>
  </div>
`;
export default template;
