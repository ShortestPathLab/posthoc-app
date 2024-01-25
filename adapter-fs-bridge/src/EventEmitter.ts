import { EventEmitter as ee } from "eventemitter3";
import TypedEmitter, { EventMap } from "typed-emitter";

export const EventEmitter: new <T extends EventMap>() => TypedEmitter<T> =
  ee as any;
