import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { Event, Nodes } from "components/render/types/render";
import { createStepNodes } from "./Nodes";
import { useMemo, createContext, useContext, ReactNode } from "react";

type NodesMapContextType = {
  nodes?: Nodes;
  events?: Event[];
  current?: Event;
}

const NodesMapContext = createContext<NodesMapContextType>({});

export const useNodesMap = () => useContext(NodesMapContext);

export function NodesMap({children}:{children: ReactNode}) {
  const [{eventList}] = useSpecimen();
  const [{step}] = useUIState();
  const nodes = useMemo(() => {
    if (eventList) {
      return createStepNodes(eventList, step??0);
    }
  }, [eventList, step])
  return (
    <NodesMapContext.Provider value={{nodes, events:eventList, current: eventList?.[step??0]}}>
      {children}
    </NodesMapContext.Provider>
  )
}