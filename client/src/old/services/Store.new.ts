import { find, values } from "lodash";
import models from "../models";

function getModel(modelName: string) {
  return find(models(), (m) => m.name === modelName);
}

export default new (class {
  data: { [K in string]: any[] } = {};

  set(name: string, attributes: any) {
    delete this.data[name];
    return this.create(name, attributes);
  }

  create(name: string, attributes: any) {
    const model = getModel(name)!;
    const record = new model(attributes) as any;
    this.data[name] = (this.data[name] ?? []).concat([record]);
    return record;
  }

  get(name: any) {
    return this.data[name]?.[0];
  }

  getById(name: any, id: any) {
    return this.data[name]?.[id];
  }

  all(name: any) {
    return values(this.data[name]);
  }

  where(name: any, condition: any) {
    return Object.values(this.data[name]).filter((record) =>
      Object.keys(condition).every((key) => record[key] == condition[key])
    );
  }

  findBy(name: any, condition: any) {
    return this.where(name, condition)[0];
  }

  count(name: any) {
    return this.data[name].length;
  }

  clear() {
    this.data = {};
  }
})();
