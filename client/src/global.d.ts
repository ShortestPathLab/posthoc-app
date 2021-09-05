declare module "js-interpreter" {
  declare class Interpreter {
    constructor(code: string);
    appendCode(code: string): void;
    step(): boolean;
    value: any;
  }
  export default Interpreter;
}
