import React from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { Event } from "components/render/types/render";

/**
 * Provide playback context to child components like step and events
 * @returns 
 */
export function Playback({children}:{children:(eventList:Event[], step:number) => JSX.Element }) {
  const [{eventList}] = useSpecimen();
  const [{step}] = useUIState();
  if (eventList && step) {
    return children(eventList, step);
  } else {
    return <></>;
  }
}