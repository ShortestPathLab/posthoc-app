import { Graphics as GraphicsType } from "@pixi/graphics";
import { CompiledD2IntrinsicComponent as CompiledD2Component } from "d2-renderer/D2IntrinsicComponents";
import * as PIXI from "pixi.js";
import { EventContext } from "protocol";

export type DrawInstruction = ((
  eventContext: EventContext
) => (graphic: GraphicsType) => void) & { persist?: boolean };

// export const  = (length: number): number => {
//   return length * (defaultContext. ?? 0);
// };

export const makeTextObject = ({
  text,
  fontSize,
  fill,
  x,
  y,
}: CompiledD2Component) =>
  new PIXI.Text(text, {
    fontFamily: "Arial",
    fontSize: fontSize,
    fill: fill,
  }).setTransform(x, y);

export const drawRect = (
  { x, y, width, height }: CompiledD2Component<"rect">,
  g: GraphicsType
) => g.drawRect(x, y, width ?? 1, height ?? 1);

export const drawCircle = (
  { x, y, radius }: CompiledD2Component<"circle">,
  g: GraphicsType
) => g.drawCircle(x, y, radius ?? 1);

export const drawPolygon = (
  { points }: CompiledD2Component<"polygon">,
  g: GraphicsType
) =>
  g.drawPolygon(
    points.map((point: { x: number; y: number }) => {
      return { x: point.x, y: point.y };
    })
  );

// export function pixiPathDrawer(
//   component: any,
//   curNode: Event | undefined,
//   nodes: Nodes,
//   color: number,
//   succesors?: Successors
// ): PIXI.Graphics {
//   const pathGraphic = new PIXI.Graphics();
//   let parentEvent: Event | undefined;

//   let compParent: any;
//   let compCurrent: any;
//   let compSuccessor: any;

//   if (succesors && curNode?.pId) {
//     pathGraphic.beginFill(0xffc0cb);
//     pathGraphic.lineStyle({ width: (0.2), color: 0xffc0cb });
//     parentEvent = nodes?.get(curNode.pId)?.[0];

//     const succesorsToDraw = succesors[curNode?.id];
//     if (succesorsToDraw) {
//       for (const succesor of succesorsToDraw) {
//         if (curNode.pId) {
//           const succesorEvent = nodes.get(succesor)?.[0];

//           if (parentEvent && succesorEvent) {
//             compSuccessor = applyContext(component, {
//               color: {},
//               nodes,
//               ...succesorEvent,
//               parent: curNode,
//             });
//             compCurrent = applyContext(component, {
//               color: {},
//               nodes,
//               ...curNode,
//               parent: parentEvent.pId
//                 ? nodes?.get(parentEvent.pId)?.[0]
//                 : parentEvent,
//             });

//             switch (component.$) {
//               case "rect":
//                 pathGraphic.moveTo(
//                   (compCurrent.x + 0.5 * compCurrent.width),
//                   (compCurrent.y + 0.5 * compCurrent.height)
//                 );
//                 pathGraphic.lineTo(
//                   (compSuccessor.x + 0.5 * compCurrent.width),
//                   (compSuccessor.y + 0.5 * compCurrent.height)
//                 );
//                 break;
//               case "circle":
//                 pathGraphic.lineStyle({ width: (0.1), color: 0xffc0cb });
//                 pathGraphic.moveTo((compCurrent.x), (compCurrent.y));
//                 pathGraphic.lineTo(
//                   (compSuccessor.x),
//                   (compSuccessor.y)
//                 );
//                 pathGraphic.lineStyle({ width: (0), color: 0xffc0cb });
//                 pathGraphic.drawCircle(
//                   (compSuccessor.x),
//                   (compSuccessor.y),
//                   (compSuccessor.radius)
//                 );
//                 break;
//             }
//           }
//         }
//       }
//     }
//   }
//   pathGraphic.beginFill(color, 1);
//   while (component && curNode?.pId) {
//     parentEvent = nodes?.get(curNode.pId)?.[0];
//     pathGraphic.lineStyle({ width: (0.2), color });

//     if (parentEvent) {
//       compParent = applyContext(component, {
//         color: {},
//         nodes,
//         ...parentEvent,
//         parent: parentEvent.pId
//           ? nodes?.get(parentEvent.pId)?.[0]
//           : parentEvent,
//       });
//       compCurrent = applyContext(component, {
//         color: {},
//         nodes,
//         ...curNode,
//         parent: parentEvent,
//       });

//       switch (component.$) {
//         case "rect":
//           pathGraphic.moveTo(
//             (compCurrent.x + 0.5 * compCurrent.width),
//             (compCurrent.y + 0.5 * compCurrent.height)
//           );
//           pathGraphic.lineTo(
//             (compParent.x + 0.5 * compCurrent.width),
//             (compParent.y + 0.5 * compCurrent.height)
//           );
//           break;
//         case "circle":
//           pathGraphic.lineStyle({ width: (0.1), color });
//           pathGraphic.moveTo((compCurrent.x), (compCurrent.y));
//           pathGraphic.lineTo((compParent.x), (compParent.y));
//           pathGraphic.lineStyle({ width: (0), color });
//           pathGraphic.drawCircle(
//             (compCurrent.x),
//             (compCurrent.y),
//             (compCurrent.radius)
//           );
//           break;
//       }
//     } else {
//       break;
//     }
//     curNode = nodes?.get(curNode.pId)?.[0];
//   }

//   pathGraphic.endFill();

//   return pathGraphic;
// }
