import { EventHandler, SyntheticEvent } from "react";

export const stopPropagation: EventHandler<SyntheticEvent> = (e) => {
  e.stopPropagation();
};
