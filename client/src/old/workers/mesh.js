onmessage = function(evt) {
  var canvas = evt.data.canvas;
  const ctx = canvas.getContext('2d');
  // ctx.fillStyle = "#444";
  // ctx.fillRect(0, 0, evt.data.width, evt.data.height);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  let polygonsArr = evt.data.polygonsArr;
  let nodeSize = evt.data.nodeSize;
  let chunkSize = 100;
  let chunks = new Array(Math.ceil(polygonsArr.length / chunkSize)).fill().map(_ => polygonsArr.splice(0,chunkSize));
  let index = 0;
  function drawMesh(){
    let chunk = chunks[index];
    chunk.forEach((polygonArr) => {
      if(polygonArr.length){
        ctx.moveTo(...(polygonArr[0]).map((pt) => pt*nodeSize));
        polygonArr.slice(1, polygonArr.length).forEach((point) => {
          ctx.lineTo(...(point.map((pt) => pt*nodeSize)));
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
    index++;
    if(index < chunks.length){
      setTimeout(drawMesh, 10);
    }
  }
  drawMesh();

  // evt.data.polygonsArr.forEach((polygonArr, index) => {
  //   console.log(index);
  //   if(polygonArr.length){
  //     ctx.moveTo(...(polygonArr[0]).map((pt) => pt*evt.data.nodeSize));
  //     polygonArr.slice(1, polygonArr.length).forEach((point) => {
  //       ctx.lineTo(...(point.map((pt) => pt*evt.data.nodeSize)));
  //     });
  //     ctx.closePath();
  //     ctx.fill();
  //     ctx.stroke();
  //   }
  // });
};
