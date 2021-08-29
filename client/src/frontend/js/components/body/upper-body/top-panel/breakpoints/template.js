let template = () => `
  <div class="btn-with-title">
    <button id='bp-btn' class="btn btn-primary" data-micromodal-trigger="bp-modal" title='Breakpoints'>
      <img class="exclamation-triangle-icon" src="icons/exclamation-triangle.svg" type="image/svg+xml" />
    </button>
    <span class="btn-title">Break Points</span>
  </div>
  <div class="modal micromodal-slide" id="bp-modal" aria-hidden="true">
    <div class="modal__overlay" tabindex="-1" data-micromodal-close>
      <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="bp-modal-title">
        <header class="modal__header">
          <h2 class="modal__title" id="bp-modal-title">
            Set Breakpoints
          </h2>
          <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
        </header>
        <hr>
        <main class="modal__content" id="bp-modal-content">
          <div class="row">
            <div class="col-sm">
              <label>Monotonic f value: </label>
              <label class="switch"><input id="bp-f-active" type="checkbox" checked=true><span class="slider round"></span></label>
            </div>
            <div class="col-sm">
              <label>Monotonic g value: </label>
              <label class="switch"><input id="bp-g-active" type="checkbox" checked=true><span class="slider round"></span></label>
            </div>
          </div>
          <br>
          <div id="bps"></div>
          <br>
          <div id="add-bp">
            <a class='modal__btn modal__btn-info'>Add Breakpoint</a>
          </div>
        </main>
        <footer class="modal__footer">
          <button id='remove-bp' class="modal__btn modal__btn-danger" data-micromodal-close>Remove</button>
          <button id='save-bp' class="modal__btn modal__btn-primary" data-micromodal-close>Save</button>
        </footer>
      </div>
    </div>
  </div>
`;
export default template;
