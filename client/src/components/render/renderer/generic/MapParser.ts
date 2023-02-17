export type GridNode = {
  x?: number;
  y?: number;
}

export type TraceMap<T> = {
  type?: string;
  bounds?: {
    width?: number;
    height?: number;
  };
  nodes?: {
    walls?: T[]
  };
}

export function parseGridMap(data: string) {
  const mapObj: TraceMap<GridNode> = {
    type: "",
    bounds: {
      width: 0,
      height: 0,
    },
    nodes: {
      walls: []
    }
  }
  const lines = data.split("\n");
  lines.map((line, lineNum) => {
    if (line.length < 20) {
      switch(line.split(" ")[0]) {
        case "type": {
          mapObj.type = line.split(" ")[1];
          return;
        }
        case "height": {
          mapObj.bounds!.height = Number.parseInt(line.split(" ")[1]);
          return;
        }
        case "width": {
          mapObj.bounds!.width = Number.parseInt(line.split(" ")[1]);
          return;
        }
        case "map": {return;}
      }
    }
    const chars = line.split("");
    chars.map((ch, charNum) => {
      if (ch === "@") {
        mapObj.nodes!.walls!.push({
          x: charNum,
          y: lineNum,
        })
      }
    });
  });
  return mapObj;
}