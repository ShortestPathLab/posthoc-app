export type GridNode = {
  x?: number;
  y?: number;
}

export type Map<T> = {
  type?: string;
  bounds?: {
    width?: number;
    height?: number;
  };
  nodes?: T[];
}

export function parseGridMap(data: string) {
  const mapObj: Map<GridNode> = {
    type: "",
    bounds: {
      width: 0,
      height: 0,
    },
    nodes: []
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
        mapObj.nodes!.push({
          x: charNum,
          y: lineNum,
        })
      }
    });
  });
  return mapObj;
}