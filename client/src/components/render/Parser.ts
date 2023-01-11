import { Render, Components, Component, Views, Context } from "./types"

const primtivesComponents = { "rect": {} }

const userComponents: Components = {
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

/**
 * 
 * @param renderDef 
 * @returns 
 */
export function parseView(renderDef: Render): Views {
  const views = renderDef.views;
  for (const viewName in views) {
    views[viewName] = parseComps(views[viewName], {})
  }
  return views;
}

/**
 * parse components definition and return a medium language representation
 * for the renderers
 * @param components List of component
 * @param injectedContext Context params provided by the upper layer of component
 * @returns A list of parsed components
 */
export function parseComps(components: Component[], injectedContext: object): Component[] {

  function parseComp(component: Component): Component[] {
    if (component["$"] in primtivesComponents) {
      const newComp: Component = { ...component }
      for (const prop in component) {
        if (isComputedProp(component[prop as keyof Component])) {
          newComp[prop as keyof Component] = parseComputedProp(component[prop as keyof Component], injectedContext)
        }
      }
      return [newComp]
    } else if (component["$"] in userComponents) {
      return parseComps(userComponents[component["$"] as keyof object],
        { ...injectedContext, ...component })
    } else {
      // ERROR TODO
      console.log("Component by the name of " + component['$'] + " does not exist")
      return []
    }
  }

  const result = components.map(parseComp).flat();
  return result;
}


/**
 * Parse computed properties into run-time executable callbacks with the 
 * context parameters provided both in search trace and run-time
 * @param val a computed prop value
 * @param injectedContext context provided by upper layer component definition
 * @returns a callback that can receive run-time context and return result of 
 *          computed value
 */
export function parseComputedProp(val: string, injectedContext: object) {

  const variableReg = /[a-zA-Z_0-9]+/g;
  const bracketsReg = /{{(.*?)}}/g;
  const squareBrackReg = /\[\[(.*?)\]\]/g
  let isPotNumProp = potRawCompProp(val);

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

  return (context: Context) =>
    Function("context", `return ${val}`)
      ({ ...injectedContext, ...context }) // This combines the two contexts and overridees the injectedContext if duplicate properties
}


export function isComputedProp(val: any) {
  if (typeof val !== "string") {
    val = JSON.stringify(val);
  }
  let re = /{{(.*?)}}/g;
  const arr = [...val.matchAll(re)];
  re = /\[\[(.*?)\]\]/g;
  arr.push(...[...val.matchAll(re)]);
  return arr.length !== 0;
}

export function potRawCompProp(val: any) {
  if (typeof val !== "string") {
    val = JSON.stringify(val);
  }
  let re = /{{(.*?)}}/g;
  const arr = [...val.matchAll(re)];
  re = /\[\[(.*?)\]\]/g;
  arr.push(...[...val.matchAll(re)]);
  return (arr.length === 1) && (arr[0][0] === arr[0].input);
}