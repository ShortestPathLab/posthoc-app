import { identity } from "lodash";
import { EventToPropsMapper } from "../Node";

export const coerce = ({ x = 0, y = 0, ...obj } = {}) => {
  return { ...obj, a: { x: x, y: y } };
};
