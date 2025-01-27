import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useEffect } from "react";

export type Selection = {
  event: MouseEvent | TouchEvent;
  node: string;
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
    registerEvents({
      clickNode: (e) => {
        // const step = sigma.getGraph().getNodeAttribute(e.node, "step");
        onSelection?.({ event: e.event.original, node: e.node });
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
