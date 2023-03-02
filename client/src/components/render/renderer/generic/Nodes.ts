import { Event, Nodes } from "protocol/Render";
import { TraceEvent } from "protocol/Trace";

export function isTopEvent(event: Event) {
  return event.type && ["source", "destination", "end"].includes(event.type);
}

// 
export function createNodes(eventList: Event[]):Nodes {
  const result:Nodes = new Map();
  for (const event of eventList) {
    if (event.id && result.has(event.id)) {
      result.get(event.id)?.push(event);
    } else if (event.id) {
      result.set(event.id, [event]);
    }
  }
  return result;
}

export function createStepNodes(eventList: Event[], step: number):Nodes {
  const result:Nodes = new Map();
  const topNodes:[[number|string, TraceEvent[]]?] = [];
  let i = 0;
  for (const event of eventList) {
    if (i <= step && event.id) {
      if (isTopEvent(event)) {
        topNodes.push([event.id,[event]]);
      } else {
        result.set(event.id, [event]);
      }
    } else {
      break;
    }
    i++;
  }
  topNodes.forEach(val => {
    if (val) {
      result.set(val[0], val[1]);
    }
  })
  return result;
}