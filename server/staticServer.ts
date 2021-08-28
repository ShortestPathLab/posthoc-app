import express from "express";
import { createCanvas } from "canvas";
import fs from "fs";
import cors from "cors";
import fse from "fs-extra";

export function initialise() {
  const app = express();
  app.use(
    cors({
      origin: "*",
    })
  );

  app.use(
    express.urlencoded({
      limit: "24mb",
      extended: true,
      parameterLimit: 50000,
    })
  );

  app.use(
    express.json({
      limit: "24mb",
    })
  );

  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

  app.post("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

  app.get("/home", (req, res) => {
    fse.outputFileSync("frontend/files.js", `window.postFiles=null`);
    res.sendFile(__dirname + "/index.html");
  });

  app.post("/home", (req, res) => {
    fse.outputFileSync("frontend/files.js", `window.postFiles=null`);
    res.sendFile(__dirname + "/index.html");
  });

  app.get("/style.css", (red, res) => {
    res.sendFile(__dirname + "/style.css");
  });

  app.get("/script.js", (red, res) => {
    res.sendFile(__dirname + "/script.js");
  });

  app.get("/docs", (req, res) => {
    res.redirect("https://krnbatta.github.io/pathfinder/#/");
  });

  app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/about.html");
  });

  app.get("/app", (req, res) => {
    fse.outputFileSync("frontend/files.js", `window.postFiles=null`);
    res.sendFile(__dirname + "/frontend/index.html");
  });

  app.post("/demo", (req, res) => {
    const data = req.body;
    // console.log(data);
    fse.outputFileSync(
      "frontend/files.js",
      `window.postFiles=${JSON.stringify(data)}`
    );
    res.sendFile(__dirname + `/frontend/index.html`);
  });

  app.post("/app", (req, res) => {
    const data = req.body;
    // console.log(data);
    let mapType,
      mapName,
      trace,
      coFile,
      grFile,
      gridFile,
      meshFile,
      traceName,
      traceFile;
    fse.outputFileSync("frontend/files.js", `window.postFiles=null`);
    mapType = data["mapType"];
    mapName = data["mapName"];
    traceName = data["traceName"];
    traceFile = `algorithms/${data["traceName"]}.json`;
    switch (data["mapType"]) {
      case "roadnetwork":
        coFile = `maps/roadnetwork/${data["mapName"]}.co`;
        grFile = `maps/roadnetwork/${data["mapName"]}.gr`;
        fse.outputFileSync(`frontend/${coFile}`, data["co"]);
        fse.outputFileSync(`frontend/${grFile}`, data["gr"]);
        fse.outputFileSync(`frontend/${traceFile}`, data["trace"]);
        fse.outputFileSync(
          "frontend/files.js",
          `window.postFiles={mapType:"roadnetwork",mapName:"${mapName}", coFile:"${coFile}",grFile:"${grFile}",traceName:"${traceName}",traceFile:"${traceFile}"}`
        );
        res.sendFile(__dirname + `/frontend/index.html`);
        break;
      case "grid":
        gridFile = `maps/grid/${data["mapName"]}.grid`;
        fse.outputFileSync(`frontend/${gridFile}`, data["grid"]);
        fse.outputFileSync(`frontend/${traceFile}`, data["trace"]);
        fse.outputFileSync(
          "frontend/files.js",
          `window.postFiles={mapType:"grid",mapName:"${mapName}", gridFile:"${gridFile}",traceName:"${traceName}",traceFile:"${traceFile}"}`
        );
        res.sendFile(__dirname + `/frontend/index.html`);
        break;
      case "mesh":
        meshFile = `maps/mesh/${data["mapName"]}.mesh`;
        fse.outputFileSync(`frontend/${meshFile}`, data["mesh"]);
        fse.outputFileSync(`frontend/${traceFile}`, data["trace"]);
        fse.outputFileSync(
          "frontend/files.js",
          `window.postFiles={mapType:"mesh",mapName:"${mapName}", meshFile:"${meshFile}",traceName:"${traceName}",traceFile:"${traceFile}"}`
        );
        res.sendFile(__dirname + `/frontend/index.html`);
        break;
      default:
        fse.outputFileSync(`frontend/${traceFile}`, data["trace"]);
        fse.outputFileSync(
          "frontend/files.js",
          `window.postFiles={traceName:"${traceName}",traceFile:"${traceFile}"}`
        );
        res.sendFile(__dirname + `/frontend/index.html`);
    }
  });

  app.get("/maps/:map", (req, res) => {
    res.sendFile(__dirname + `/frontend/maps/images/${req.params.map}.png`);
  });

  app.get("/maps/:mapType/:map", (req, res) => {
    res.sendFile(
      __dirname + `/frontend/maps/${req.params.mapType}/${req.params.map}`
    );
  });

  app.get("/algorithms/:algorithm", (req, res) => {
    res.sendFile(__dirname + `/frontend/algorithms/${req.params.algorithm}`);
  });

  app.get("/files.js", (req, res) => {
    res.sendFile(__dirname + "/frontend/files.js");
  });

  app.get("/canvas-svg.js", (req, res) => {
    res.sendFile(__dirname + "/frontend/canvas-svg.js");
  });

  app.get("/dist/:file", (req, res) => {
    res.sendFile(__dirname + `/frontend/dist/${req.params.file}`);
  });

  app.get("/images/:image_file", (req, res) => {
    res.sendFile(__dirname + `/frontend/images/${req.params.image_file}`);
  });

  app.get("/icons/:icon_file", (req, res) => {
    res.sendFile(__dirname + `/frontend/images/icons/${req.params.icon_file}`);
  });

  app.post("/processRoadNetwork", (req, res) => {
    const coData = req.body.coData;
    const grData = req.body.grData;
    const canvas = createCanvas(coData.maxX * 0.01 + 1, coData.maxY * 0.01 + 1);
    const context = canvas.getContext("2d");
    // context.imageSmoothingEnabled = true;
    // canvas.width = coData.maxX * 0.01 + 1;
    // canvas.height = coData.maxY * 0.01 + 1;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.strokeStyle = "black";
    coData.coordinates.forEach((p) => {
      context.beginPath();
      context.arc(p.x * 0.01, p.y * 0.01, 1, 0, 2 * Math.PI);
      context.fill();
    });

    grData.lines.forEach((l) => {
      let from = coData.coordinates[l[0]];
      let to = coData.coordinates[l[1]];
      context.beginPath();
      context.moveTo(from.x * 0.01, from.y * 0.01);
      context.lineTo(to.x * 0.01, to.y * 0.01);
      context.lineWidth = 0.5;
      context.stroke();
    });

    let img = canvas.toDataURL();
    let data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, "base64");
    fs.writeFile(`frontend/maps/images/ny.png`, buf, function (err) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.send({
          done: true,
        });
      }
    });
  });

  app.post("/processMesh", (req, res) => {
    const meshData = req.body;
    const polygonsArr = meshData.polygonsArr;
    const maxX = meshData.maxX;
    const maxY = meshData.maxY;
    const fileName = meshData.fileName;
    const canvas = createCanvas(meshData.maxX, meshData.maxY);
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    //   canvas.width = meshData.maxX;
    //   canvas.height = meshData.maxY;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "black";
    for (let i = 0; i < polygonsArr.length; ++i) {
      let polygon = polygonsArr[i];
      context.beginPath();
      let j,
        k,
        temparray,
        chunk = 2;
      for (j = 0, k = polygon.length; j < k; j += chunk) {
        temparray = polygon.slice(j, j + chunk);
        if (j == 0) {
          context.moveTo(temparray[0], temparray[1]);
        } else {
          context.lineTo(temparray[0], temparray[1]);
        }
      }
      context.stroke();
    }
    let img = canvas.toDataURL();
    let data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, "base64");
    fs.writeFile(`frontend/maps/images/${fileName}.png`, buf, function (err) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.send({
          done: true,
        });
      }
    });
  });

  app.post("/processGrid", (req, res) => {
    const fileName = req.body.fileName;
    const height = req.body.height;
    const width = req.body.width;
    const gridStr = req.body.gridStr;

    const canvas = createCanvas(width * 16, height * 16);
    //   canvas.width = width * 16;
    //   canvas.height = height * 16;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";

    for (let y = 0; y <= height; y++) {
      for (var x = 0; x <= width; x++) {
        var stringIndex = y * width + x;
        if (gridStr[stringIndex] == "@") {
          ctx.fillRect(x * 16, y * 16, 16, 16);
        }
      }
    }

    ctx.fillStyle = "green";

    for (var y = 0; y <= height; y++) {
      for (var x = 0; x <= width; x++) {
        var stringIndex = y * width + x;
        if (gridStr[stringIndex] == "T") {
          ctx.fillRect(x * 16, y * 16, 16, 16);
        }
      }
    }

    for (var i = 0; i <= width; i++) {
      let x1, x2, y1, y2;
      x1 = i * 16;
      x2 = i * 16;
      y1 = 0;
      y2 = height * 16;
      if (i == 0) {
        x1 += 1;
        x2 += 1;
      }
      if (i == width) {
        x1 -= 1;
        x2 -= 1;
      }
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    for (var i = 0; i <= height; i++) {
      let x1, x2, y1, y2;
      y1 = i * 16;
      y2 = i * 16;
      x1 = 0;
      x2 = width * 16;
      if (i == 0) {
        y1 += 1;
        y2 += 1;
      }
      if (i == height) {
        y1 -= 1;
        y2 -= 1;
      }
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    //check if there is better export image
    //check image quality
    let img = canvas.toDataURL();
    let data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, "base64");
    fs.writeFile(`frontend/maps/images/${fileName}.png`, buf, function (err) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.send({
          done: true,
        });
      }
    });
  });

  app.listen(8000, () => {
    console.log("Example app listening on port 8000!");
  });
  return app;
}
