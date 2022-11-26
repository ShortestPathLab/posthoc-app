import { startCase } from "lodash";

export default class MockClass {
  hi(name: string) {
    return startCase(name);
  }
}
