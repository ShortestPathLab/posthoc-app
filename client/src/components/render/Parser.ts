

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
 * TC6: "{{`${x}${y}`}}", return  context["x"] + context["y"]
 * TC6: "[[x]]", return (context) => context[context["x"]]
 * TC7: "[[`${x}${y}`]]", return (context) => context[context["x"]+context["y"]]
 */

// "{{x}} + {{y}}" -> "context.x + context.y" -> eval("context.x + context.y") -> 1+2 -> 3
export function parseCompProp(val: string, injectedContext: object) {
  // const re = /{{(.*?)}}/g;
  // const arr = [...val.matchAll(re)];
  // // replace
  // val.replace(re, arg2)
  // return (context: object) => {
    
  // }
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