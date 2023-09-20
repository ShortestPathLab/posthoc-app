// @ts-nocheck
import * as d3 from "d3-hierarchy";
import { TraceEvent } from "protocol/Trace";
import { tileEvents } from "./tileEvents";

export function processTree(eventList: TraceEvent[]) {
  let obj: {
    [key: string | number]: {
      id: string | number;
      parentId: string | number | undefined | null;
    };
  } = {};
  eventList.forEach((event) => {
    if (obj[event.id]) {
      obj[event.id].id = event.id;
      obj[event.id].parentId = event.pId;
    } else {
      obj[event.id] = { id: event.id, parentId: event.pId };
    }
  });

  let table = Object.values(obj);

  let root = d3.stratify()(table);
  let height = root.height + 1;
  root = d3.tree().nodeSize([100, 100]).size([height, height])(root);
  root.descendants().forEach((node) => {
    // TODO optimize this code, which basically adds the x and y coordinates to the eventList information
    eventList = eventList.map((event) => {
      if (event.id === node.data.id) {
        return { ...event, x: node.x, y: node.y };
      } else {
        return event;
      }
    });
  });

  return eventList;
}

processTree(tileEvents);
