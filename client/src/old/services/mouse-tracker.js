/** @module services/mouse-tracker
* This service is responsible for setting up latest x and y position of mouse on the context.
*/
export default function(context){
  document.addEventListener('mousemove', onMouseUpdate, false);
  document.addEventListener('mouseenter', onMouseUpdate, false);

  function onMouseUpdate(e) {
    context.x = e.pageX;
    context.y = e.pageY;
  }
}
