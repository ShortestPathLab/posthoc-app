import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useEffect } from "react";

export type Selection = {
  event: MouseEvent | TouchEvent;
  node: string;       // will be logicalId if available
};

export function GraphEvents({
  layerKey,
  onSelection,
}: {
  layerKey?: string;
  onSelection?: (e: Selection) => void;
}) {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    const graph = sigma.getGraph();
    // added logical node for scatter plot colouring
    registerEvents({
      clickNode: (e) => {
        const sigmaNodeKey = e.node; 
        let logicalId = sigmaNodeKey;

        if (graph.hasNode(sigmaNodeKey)) {
          const maybeLogicalId = graph.getNodeAttribute(
            sigmaNodeKey,
            "logicalId"
          );
          if (maybeLogicalId !== undefined && maybeLogicalId !== null) {
            logicalId = String(maybeLogicalId); 
          }
        }

        onSelection?.({
          event: e.event.original,
          node: logicalId,
        });
      },
      enterNode: () => {
        document.body.style.cursor = "pointer";
      },
      leaveNode: () => {
        document.body.style.cursor = "";
      },
    });
  }, [layerKey, registerEvents, sigma]);

  return null;
}
