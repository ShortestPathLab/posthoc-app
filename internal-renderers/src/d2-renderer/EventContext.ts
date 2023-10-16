import { D2Base } from "./D2IntrinsicComponents";
import { Event, Nodes } from "protocol";

export type EventContext = {
  parent: Event | undefined;
  nodes?: Nodes;
  color: {
    [key: string]: number;
  };
  scale?: number;
} & Event;
// default context

export const defaultContext: Partial<D2Base> & Partial<EventContext> = {
  current: undefined,
  parent: undefined,
  events: undefined,
  color: {
    source: 0x26a69a,
    destination: 0xf06292,
    expanding: 0xff5722,
    updating: 0xff5722,
    generating: 0xffeb3b,
    closing: 0xb0bec5,
    end: 0xec407a,
  },
  scale: 10,
  fill: "#000000",
  alpha: 1,
};
