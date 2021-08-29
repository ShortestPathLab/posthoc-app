function main(data) {
  var canvas = data.canvas;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = "#000";
  let polygonsArr = data.polygonsArr;
  let nodeSize = data.nodeSize;
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
        ctx.stroke();
      }
    });
    index++;
    if(index < chunks.length){
      setTimeout(drawMesh, 10);
    }
  }
  drawMesh();
};
