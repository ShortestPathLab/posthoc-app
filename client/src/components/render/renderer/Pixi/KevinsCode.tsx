///@ts-nocheck

import { memoize } from "lodash";
import {
  Component,
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
} from "react";

/*<PIXIStage> <- Creates a react context
    <LazyNodeList /> <- Uses the react context
</Stage>

<HTMLCanvasStage> <- Should provide context
    <LazyNodeList /> <- Should also be generic
    <SomeOtherElement />
</HTMLCanvasStage>

- background
- path from source -> destination*/

type UnregisterFunction = () => void;

type StandardDrawingContext = {
  add: (items: { component: any; event: any }[]) => UnregisterFunction;
};

type StandardCanvasProps = {
  onClick: (stepNumber: number, e: any) => void;
};

const DrawingContext = createContext<StandardDrawingContext>();

// How to define a type for generic canvas
// Take in `StandardCanvasProps` props
type StandardCanvas = Component<StandardCanvasProps>;

function drawRect() {}
function drawCircle() {}

export default function PIXICanvas({ onClick }: StandardCanvasProps) {
  const drawInstructions = {
    // do not use lodash memoise
    // use memoizee, look up how to hash objects
    rect: memoise((event) => {
      // does smth here
      // resolves functional properties
      // does the eval stuff
      // so memoising this might be helpful
      return () => {};
    }),
    circle: () => {},
  };

  const canvasRef: PIXIStage;

  const makeGraphic = memoize((items) => {
    const graphic = new PIXI.graphic();
    for (const { component, event } of items) {
      // smth like
      drawInstructions[component.$](event)();
      // process component
      // draw to graphic
    }
    return graphic;
  });

  const reference: StandardDrawingContext = useCallback(
    () => ({
      add: (items) => {
        // Prepare graphic
        const graphic = makeGraphic(items);
        canvasRef.addChild(graphic);
        return () => {
          canvas.removeChild(graphic);
        };
      },
    }),
    [canvasRef]
  );

  return (
    <DrawingContext.Provider value={reference}>
      <PIXIStage>
        <PIXIViewport></PIXIViewport>
      </PIXIStage>
    </DrawingContext.Provider>
  );
}

export default function LazyNodeList() {
  return (
    <>
      <NodeList></NodeList>
      <NodeList></NodeList>
    </>
  );
}

export default function NodeList({ items }) {
  const drawingFunctions = useContext(DrawingContext);
  useEffect(() => {
    const remove = drawingFunctions.add(items);
    return () => {
      remove();
    };
  }, [items]);

  return <></>;
}