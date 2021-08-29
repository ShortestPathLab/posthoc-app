let template = () => `
  <div class="btn-with-title">
    <button id='cp-btn' class="btn btn-primary" data-micromodal-trigger="cp-modal" title='Compare Traces'><img class='clone-icon' src="icons/clone.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Compare Traces</span>
  </div>
  <div class="modal micromodal-slide" id="cp-modal" aria-hidden="true">
    <div class="modal__overlay" tabindex="-1" data-micromodal-close>
      <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="cp-modal-title">
        <header class="modal__header">
          <h2 class="modal__title" id="cp-modal-title">
            Compare Trace
          </h2>
          <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
        </header>
        <hr>
        <main class="modal__content" id="cp-modal-content">
          <div id="faulty-trace">
            <label id="faulty-trace-label" for="faulty-trace-input"><img class="terminal-icon" src="icons/terminal.svg" type="image/svg+xml" /> Upload Trace</label>
            <input type = 'file' id='faulty-trace-input' accept='.json' />
          </div>
          <hr>
          <div id="cp-bps">
            <ol></ol>
          </div>
        </main>
        <footer class="modal__footer">
          <button id='cancel-cp' class="modal__btn modal__btn-danger" data-micromodal-close>Close</button>
          <button id='run-cp' class="modal__btn modal__btn-primary">Compare</button>
        </footer>
      </div>
    </div>
  </div>
`;
export default template;
