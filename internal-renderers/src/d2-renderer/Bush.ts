import RBush from "rbush";
import { Body } from "./D2RendererWorker";

export class Bush<T> extends RBush<Body<T>> {
  toBBox(b: Body<T>) {
    return { minX: b.left, minY: b.top, maxX: b.right, maxY: b.bottom };
  }
  compareMinX(a: Body<T>, b: Body<T>) {
    return a.left - b.left;
  }
  compareMinY(a: Body<T>, b: Body<T>) {
    return a.top - b.top;
  }
}
