import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useEffect } from "react";
import { CameraState } from "sigma/types";

export type Selection = {
  event: MouseEvent | TouchEvent;
  node: string;
};

export function GraphEvents({
  key,
  onSelection,
  onRerender,
}: {
  key?: string;
  onSelection?: (e: Selection) => void;
  onRerender?: (cameraPosition: CameraState) => void;
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
      beforeRender: () => {
        const cameraStatus = sigma.getCamera().getState();
        onRerender?.(cameraStatus);
      },
    });
  }, [key, registerEvents, sigma]);
  return null;
}
