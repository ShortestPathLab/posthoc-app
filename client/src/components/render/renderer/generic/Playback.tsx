import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { Event, Nodes } from "components/render/types/render";
import { createNodes, createStepNodes } from "./Nodes";
import { useMemo } from "react";

/**
 * Provide playback context to child components like step and events
 * @returns 
 */
export function Playback({children}:{children:(nodes:Nodes, step:number) => JSX.Element }) {
  const [{eventList}] = useSpecimen();
  const [{step}] = useUIState();
  const nodes = useMemo(() => {
    if (eventList) {
      return createStepNodes(eventList, step??0);
    }
  }, [eventList, step])
  return children(nodes??new Map<string|number, Event[]>(), step??0);
}