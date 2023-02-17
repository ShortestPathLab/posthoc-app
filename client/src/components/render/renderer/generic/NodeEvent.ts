import { Event, NodeEvents } from "components/render/types/render";

export function createNodeEvents(eventList: Event[]):Map<string|number, Event[]> {
  const result: Map<string|number, Event[]> = new Map();
  for (const event of eventList) {
    if (event.id && result.has(event.id)) {
      result.get(event.id)?.push(event);
    } else if (event.id) {
      result.set(event.id, [event]);
    }
  }
  return result;
}