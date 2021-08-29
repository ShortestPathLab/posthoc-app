let template = () => `
  <!--<input type="number" id="travel-jump-input" min="1">
  <button id='travel-jump' title='Travel Jump'><i class='fas fa-2x fa-plane'></i></button>
  <input type="number" id="travel-backward-input" min="1">-->
  <!--<button id='travel-event-backward' title='Travel Back(Event)'><i class='fas fa-2x fa-step-backward'></i></button>
  <input type="number" id="travel-event-input" min="1">
  <button id='travel-event-forward' title='Travel Forward(Event)'><i class='fas fa-2x fa-step-forward'></i></button>
  <button id='travel-expansion-backward' title='Travel Back(Expansion)'><i class='fas fa-2x fa-fast-backward'></i></button>
  <input type="number" id="travel-expansion-input" min="1">
  <button id='travel-expansion-forward' title='Travel Forward(Expansion)'><i class='fas fa-2x fa-fast-forward'></i></button>-->

  <div class="btn-with-title">
    <button id='tt-btn' class="btn btn-primary" data-micromodal-trigger="tt-modal" title='Time Travel'><img class="stopwatch-icon" src="icons/stopwatch.svg" type="image/svg+xml" /></button>
    <span class="btn-title">Jump Steps</span>
  </div>
  <div class="modal micromodal-slide" id="tt-modal" aria-hidden="true">
    <div class="modal__overlay" tabindex="-1" data-micromodal-close>
      <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="tt-modal-title">
        <header class="modal__header">
          <h2 class="modal__title" id="tt-modal-title">
            Move in steps
          </h2>
        </header>
        <hr>
        <main class="modal__content" id="tt-modal-content">
          <div class="row">
            <div class="col-sm">
              <input type="number" id="tt-input" min="1">
            </div>
            <div class="col-sm">
              <select id="tt-type">
                <option>Event</option>
                <option>Expansion</option>
                <option>Breakpoint</option>
              </select>
            </div>
            <div class="col-sm">
              <select id="tt-direction">
                <option>Forward</option>
                <option>Backward</option>
              </select>
            </div>
          </div>
        </main>
        <footer class="modal__footer">
          <button id='cancel-tt' class="modal__btn modal__btn-danger" data-micromodal-close>Cancel</button>
          <button id='go-tt' class="modal__btn modal__btn-primary" data-micromodal-close>Go</button>
        </footer>
      </div>
    </div>
  </div>

`;
export default template;
