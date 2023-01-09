
export function parseView() {

}

export function parseComp() {

}

/**
 * Tests for parseCompProp function
 * 
 * TC1: "{{x}}", return (context) => context["x"]
 * TC2: "{{x}} + {{y}}", return (context) => `${context["x"]} + ${context["y"]}`
 * TC3: "{{x}} {{y}}", return (context) => `${context["x"]} ${context["y"]}`
 * TC4: "{{`${x}`}}", return (context) => `${context["x"]}`
 * TC5: "{{`${x} ${y}`}}", return `${context["x"]} ${context["y"]}`
 * TC6: "{{x + y}}", return context["x"] + context["y"]
 * TC7: "[[x]]", return (context) => context[context["x"]]
 * TC8: "[[`${x}${y}`]]", return (context) => 
 *                                context[`${context["x"]}${context["y"]}`]
 */

// TC1: "{{xy}}", return (context) => context["xy"]
// "{{x}} + {{y}}" -> "context.x + context.y" -> eval("context.x + context.y") -> 1+2 -> 3
export function parseCompProp(val: string, injectedContext: object) {

  const variableReg = /[a-zA-Z_0-9]+/g;
  const bracketsReg = /{{(.*?)}}/g;
  const squareBrackReg = /\[\[(.*?)\]\]/g  
  let isPotNumProp = potNumCompProp(val);

  function parseBracers(str:string, p1:string) {
      return isPotNumProp ? p1.replace(variableReg, parseVariable)
                          : "${" + p1.replace(variableReg, parseVariable) + "}"
  }

  function parseSquareBrackets(str:string, p1:string) {
    return isPotNumProp ? `context[${p1.replace(variableReg, parseVariable)}]` : "context[`${" + p1.replace(variableReg, parseVariable) + "}`]"
  }

  function parseVariable(str:string) {
    return `context["${str}"]` 
  }


  val = val.replace(bracketsReg, parseBracers);
  val = val.replace(squareBrackReg, parseSquareBrackets)
  if (!isPotNumProp){
    val = `\`${val}\``
  }

  console.log(val);

  return (context: object) => Function("context", `return ${val}`)(context)
}


export function isCompProp(val: any) {
  if (typeof val !== "string") {
    val = JSON.stringify(val);
  }
  let re = /{{(.*?)}}/g;
  const arr = [...val.matchAll(re)];
  re = /\[\[(.*?)\]\]/g;
  arr.push(...[...val.matchAll(re)]);
  return arr.length !== 0;
}

export function potNumCompProp(val: any) {
  if (typeof val !== "string") {
    val = JSON.stringify(val);
  }
  let re = /{{(.*?)}}/g;
  const arr = [...val.matchAll(re)];
  re = /\[\[(.*?)\]\]/g;
  arr.push(...[...val.matchAll(re)]);
  return (arr.length === 1) && (arr[0][0] === arr[0].input);
}

export function GenericContext() {

}