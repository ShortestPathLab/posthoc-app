import { Graphics as GraphicsType } from "@pixi/graphics";
import {
  CompiledD2IntrinsicComponent,
  D2InstrinsicComponents as D2Components,
} from "d2-renderer/D2IntrinsicComponents";
import { defaultContext } from "./old/EventContext";
import { drawCircle, drawPolygon, drawRect, makeTextObject } from "./draw";

function cast<T extends keyof D2Components>(obj: any) {
  return obj as CompiledD2IntrinsicComponent<T>;
}

export const draw = <T extends keyof D2Components>(
  components: CompiledD2IntrinsicComponent<T>[],
  g: GraphicsType
) => {
  components.map((c) => {
    g.beginFill(c.fill, c.alpha ?? defaultContext.alpha);
    switch (c.$) {
      case "rect":
        drawRect(cast<"rect">(c), g);
        break;
      case "circle":
        drawCircle(cast<"circle">(c), g);
        break;
      case "path":
        g.lineStyle({
          width: cast<"path">(c).lineWidth,
          color: c.fill,
        });
      case "polygon":
        drawPolygon(cast<"polygon">(c), g);
        break;
      default:
        throw ComponentUndefinedError(c);
    }
    g.endFill();
    if (c?.text) {
      g.addChild(makeTextObject(c));
    }
  });
  return g;
};

const ComponentUndefinedError = (c: CompiledD2IntrinsicComponent) =>
  new Error(`The component ${c.$} is not supported by this renderer.`);

// export const compile = <T extends keyof D2Components>(
//   component: CompiledComponent<T, D2Components[T]>
// ) => {
//   return () => {
//     const color = ctx.color?.[ctx.type!] ?? 0;
//     return (g: GraphicsType) => {
//       const fillColor = component.fill(ctx) ?? color;
//       g.beginFill(fillColor, component.alpha(ctx) ?? defaultContext.alpha);
//       switch (component.$) {
//         case "rect":
//           drawRect(ctx, cast<"rect">(component), g);
//           break;
//         case "circle":
//           drawCircle(ctx, cast<"circle">(component), g);
//           break;
//         case "path":
//           g.lineStyle({
//             width: cast<"path">(component).lineWidth(ctx),
//             color: fillColor,
//           });
//         case "polygon":
//           drawPolygon(ctx, cast<"polygon">(component), g);
//           break;
//         default:
//           throw Error(
//             `The component ${String(
//               component.$
//             )} is not supported by the 2D renderer.`
//           );
//       }
//       g.endFill();
//       if (component?.text?.(ctx)) {
//         const text = createTextObject(ctx, component);
//         g.addChild(text);
//       }
//     };
//   };
// };
