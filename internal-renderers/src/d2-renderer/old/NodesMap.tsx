import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { Event, Nodes } from "protocol/Render";
import { createNodes, createStepNodes } from "./Nodes";
import {
  useMemo,
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";
import { NodePopup } from "components/generic/NodePopup";
import { Successors } from "../types";

export type ClickInfo = {
  node?: Event[];
  nodes?: Event[];
  point?: {
    x: number;
    y: number;
  };
  remove?: () => void;
  overlay?: any;
};

type NodesMapContextType = {
  nodes?: Nodes; // nodes state at current step
  nodesAll?: Nodes; // all nodes converted from eventlist
  eventsAll?: Event[]; // original eventList
  current?: Event; // current event
  successors?: Successors;
  click?: ClickInfo | undefined;
  setClick?: (info: ClickInfo | undefined) => void;
};

const NodesMapContext = createContext<NodesMapContextType>({});

export const useNodesMap = () => useContext(NodesMapContext);

export function NodesMap({ children }: { children: ReactNode }) {
  const [{ eventList }] = useSpecimen();
  const [{ step, playback }] = useUIState();

  const [click, setClick] = useState<ClickInfo>();

  const nodesAll = useMemo(() => {
    if (eventList) {
      return createNodes(eventList);
    }
  }, [eventList]);
  const nodes = useMemo(() => {
    if (eventList) {
      return createStepNodes(eventList, step ?? 0);
    }
  }, [eventList, step]);

  const successors = useMemo(() => {
    let successors: Successors = {};
    let i = 0;
    if (eventList) {
      for (const event of eventList) {
        if (step && i <= step && event.id) {
          if (event.pId) {
            if (successors[event.pId]) {
              successors[event.pId].add(event.id);
            } else {
              successors[event.pId] = new Set([event.id]);
            }
          }
          i++;
        }
      }
    }
    return successors;
  }, [playback, eventList]);

  return (
    <NodesMapContext.Provider
      value={{
        nodes,
        nodesAll,
        eventsAll: eventList,
        current: eventList?.[step ?? 0],
        click,
        successors,
        setClick,
      }}
    >
      <NodePopup {...click} />
      {children}
    </NodesMapContext.Provider>
  );
}
