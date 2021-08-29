const config = {
  clientAddr: "http://localhost:8000",
  serverAddr: "http://localhost:8000",
  processGridUrl: "http://localhost:8000/processGrid",
  processMeshUrl: "http://localhost:8000/processMesh",
  processRoadNetworkUrl: "http://localhost:8000/processRoadNetwork",
  zooming: true,
  operationsPerSecond: 300,
  lineColor: 0x00DD00,
  wallColor: 0xD3D3D3,
  pathColor: 0xFFFFFF,
  borderColor: 0x000000,
  borderWidth: 0.1,
  nodeSize: 20,
  roadNetworkScale: 0.005,
  nodeAttrs: {
    source: {
      fillColor: 0x00DD00,
      lightColor: 0x70FF70
    },
    destination: {
      fillColor: 0xE40E40,
      lightColor: 0xF67996
    },
    opened: {
      fillColor: 0x4363D8,
      lightColor: 0x889DE7
    },
    frontier: {
      fillColor: 0xFFE119,
      lightColor: 0xFFEC70
    },
    current: {
      fillColor: 0xF58231,
      lightColor: 0xF9AD77
    },
    closed: {
      fillColor: 0x911EB4,
      lightColor: 0xD385EA
    }
  }
}

export default config;
