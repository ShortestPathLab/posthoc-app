import { Render, Component } from "../renderer/types"

const primtivesComponents = { "rect": {} }

const userComponents = {
  "tile": [
    {
      "$": "rect",
      "width": 1,
      "height": 1,
      "text": "{{`${x}${y}`}}"
    }
  ],
  "tilerow": [
    {
      "$": "tile",
      "x": 1
    },
    {
      "$": "tile",
      "x": 2
    },
    {
      "$": "tile",
      "x": 3
    }
  ],
  "tileboard": [
    {
      "$": "tilerow",
      "y": 1
    },
    {
      "$": "tilerow",
      "y": 2
    },
    {
      "$": "tilerow",
      "y": 3
    }
  ]
}

// parseView -> parseComps -> parseComp -> parseCompProp -> ....

export function parseView(renderDef: Render) {
  //parseComps();
}


export function parseComps(components: Component[], injectedContext: any): Component[] {

  function parseComp(component: Component): Component[] {

    if (component["$"] in primtivesComponents) {
      const newComp: Component = { ...component }

      for (const prop in component) {
        if (isCompProp(component[prop as keyof Component])) {
          newComp[prop as keyof Component] = parseCompProp(component[prop as keyof Component], injectedContext)
        }
      }

      return [newComp]
    }

    else if (component["$"] in userComponents) {

      return parseComps(userComponents[component["$"] as keyof object],
        { ...injectedContext, ...component })
    }

    else {

      // ERROR TODO
      console.log("Component by the name of " + component['$'] + " does not exist")

      return []
    }
  }

  return components.map(parseComp).flat();
}


export function parseCompProp(val: string, injectedContext: object) {

  const variableReg = /[a-zA-Z_0-9]+/g;
  const bracketsReg = /{{(.*?)}}/g;
  const squareBrackReg = /\[\[(.*?)\]\]/g
  let isPotNumProp = potNumCompProp(val);

  function parseBracers(str: string, p1: string) {
    return isPotNumProp ? p1.replace(variableReg, parseVariable)
      : "${" + p1.replace(variableReg, parseVariable) + "}"
  }

  function parseSquareBrackets(str: string, p1: string) {
    return isPotNumProp ? `context[${p1.replace(variableReg, parseVariable)}]` : "context[`${" + p1.replace(variableReg, parseVariable) + "}`]"
  }

  function parseVariable(str: string) {
    return `context["${str}"]`
  }

  // first replaces the bracers
  val = val.replace(bracketsReg, parseBracers);

  // then replaces the square brackets
  val = val.replace(squareBrackReg, parseSquareBrackets)

  // if it isnt a number (thus a string) then additional quotations are added
  if (!isPotNumProp) {
    val = `\`${val}\``
  }

  return (context: object) =>
    Function("context", `return ${val}`)
      ({ ...injectedContext, ...context }) // This combines the two contexts and overridees the injectedContext if duplicate properties
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