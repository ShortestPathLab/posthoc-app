import { Render, Components, Component, Views, Context, UserContext } from "./types"

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
 * A parser for a list of Components
 * @param components a list of Components
 * @param injectedContext user injected context (from parent Components)
 * @returns a list of parsed Components
 * @todo fix the error handling
 */
export function parseComps(components: Component[], injectedContext: UserContext): Component[] {

  /**
   * Parses a single Component
   * @param component a individual component
   * @returns a list of parsed Components
   * @todo fix the primitvesComponents and userComponents
   */
  function parseComp(component: Component): Component[] {

    // Checks to see if the name of the component matches a primitive
    if (component["$"] in primtivesComponents) {
      // creates a copy of the component
      const newComp: Component = { ...component }

      // goes through all the properties of the component and parses them when necessary
      for (const prop in component) {
        if (isComputedProp(component[prop as keyof Component])) {
          newComp[prop as keyof Component] = parseComputedProp(component[prop as keyof Component], injectedContext)
        }
      }
      return [newComp]
    }

    // Checks to see if the name of the component matches a user defined component
    else if (component["$"] in userComponents) {

      // When an user component need to recurse down and parse that user defined component
      return parseComps(userComponents[component["$"] as keyof object],
        { ...injectedContext, ...component })
    }

    // Error Handling
    else {

      // ERROR TODO
      console.log("Component by the name of " + component['$'] + " does not exist")
      return []
    }
  }

  return components.map(parseComp).flat();
}


/**
 * Parses a computed property into JavaScript code.
 * @param val the computed property to be parsed.
 * @param injectedContext any addtional context provided
 * @returns a Function that takes more in more Context and returns a value
 */
export function parseComputedProp(val: string, injectedContext: UserContext): Function {

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


/**
 * Checks to see is a property is a computed property.
 * @param val the value of the property to be parsed
 * @returns True if the computed property includes "{{}}", False otherwise
 */
export function isComputedProp(val: any): boolean {
  if (typeof val !== "string") {
    val = JSON.stringify(val);
  }
  let re = /{{(.*?)}}/g;
  const arr = [...val.matchAll(re)];
  re = /\[\[(.*?)\]\]/g;
  arr.push(...[...val.matchAll(re)]);
  return arr.length !== 0;
}


/**
 * Checks to see what type the computed property should be parsed to.
 * If True this means the type will be whatever the type of the property is.
 * If False this means it will be converted into a string.
 * @param val the value of the property to be parsed
 * @returns False if to be parsed to string, True otherwise
 */
export function potRawCompProp(val: any): boolean {
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