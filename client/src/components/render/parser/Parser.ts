import { Component, Components, Render } from "../types/render"
import { Context } from "../types/context"
import { primitiveComponents, inbuiltSearchFormats } from "../renderer/primitives"
import { isArray, set } from "lodash";
import { Interlang } from "slices/specimen";


let renderName: string | undefined;
/**
 * Parses all reviews in a Render
 * @param renderDef the render which contains the views to be parsed
 * @returns the parsed Views
 */
export function parseViews(renderDef: Render): Interlang | undefined {
  const views = renderDef.views;
  const userComp = renderDef.components ? renderDef.components : {}
  const userContext = renderDef.context ? renderDef.context : {}
  let inbuiltComps = {};

  for (const viewName in views) {
    renderName = views?.[viewName]?.["renderer"];

    // TODO fix the typing so that components is only a single object
    if (renderName && views?.[viewName]?.components?.[0]?.$) {
      const compName = views?.[viewName]?.components?.[0]?.$
      if (compName && inbuiltSearchFormats[renderName][compName]) {
        inbuiltComps = inbuiltSearchFormats[renderName][compName]
        console.log(inbuiltComps)
      }
      else {
        inbuiltComps = {}
      }
    }

    set(views, `${viewName}.components`, parseComps(views?.[viewName]?.["components"], userContext, userComp, inbuiltComps));
    set(views, `${viewName}.persist`, views?.[viewName]?.persist ?? true ? true : false);
  }

  return views;
}

/**
 * A parser for a list of Components
 * @param components a list of Components
 * @param injectedContext user injected context (from parent Components)
 * @returns a list of parsed Components
 * @todo fix the error handling for required fields
 */
export function parseComps(components: Component[] | undefined, injectedContext: Context, userComponents: Components, inbuiltComps:Components): Component[] {

  /**
   * Parses a single Component
   * @param component a individual component
   * @returns a list of parsed Components
   * @todo fix the primitvesComponents and userComponents
   */
  function parseComp(component: Component): Component[] {

    // Checks to see if the name of the component matches a primitive
    if (component["$"] in primitiveComponents) {

      if (renderName !== undefined && primitiveComponents[component["$"]]["renderer"] !== renderName) {
        throw new Error("Component renderer definition is not match to supported renderer");
      }

      // creates a copy of the component
      const newComp: Component = { ...injectedContext, ...component }


      // goes through all the properties of the component and parses them when necessary
      for (const prop in component) {
        if (prop !== "$" && prop !== "persisted") {
          newComp[prop as keyof Component] = parseProperty(component[prop as keyof Component], { ...injectedContext, ...component })
        }
      }
      return [newComp]
    }

    else if (component["$"] in inbuiltComps){
        // When an inbuiltComps need to recurse down and parse that inbuiltComps
        return parseComps(inbuiltComps[component["$"] as keyof Object],
        { ...injectedContext, ...component }, userComponents, inbuiltComps)
    
    }

    // Checks to see if the name of the component matches a user defined component
    else if (component["$"] in userComponents) {

      // When an user component need to recurse down and parse that user defined component
      return parseComps(userComponents[component["$"] as keyof Object],
        { ...injectedContext, ...component }, userComponents, inbuiltComps)
    }

    else {
      throw new Error("Component by the name of " + component['$'] + " does not exist");
    }
  }

  if (components === undefined) {
    throw new Error("Parse Error. Search trace components result in undefined.");
  }
  const result = components.map(parseComp).flat();
  return result;
}

/**
 * Takes in an array of Functions and makes it so that all of them are connected by the same parent function
 * @param array the array of Functions
 * @param injectedContext additional context provided to the functions
 * @returns a single Function which contains all the other Functions
 */
function arrayOfFunctions(array: Function[], injectedContext: Context) {

  return (context: Context) => array.map((ele: Function) => ele({ ...injectedContext, ...context }))
}

/**
 * Takes in an object of Functions and makes it so that all of them are connected by the same parent function
 * @param object the object of Functions
 * @param injectedContext dditional context provided to the functions
 * @returns a single Function which contains all the other Functions
 */
function objectOfFunctions(object: { [K: string]: Function }, injectedContext: Context) {

  return (context: Context) => {
    const newObject: { [K: string]: any } = {};
    for (const prop in object) {
      newObject[prop] = object[prop]({ ...injectedContext, ...context })
    }
    return newObject
  }
}

/**
 * Parses a single property (recursively calling down if required)
 * @param val the value of the property to parse
 * @param injectedContext additional context for the property
 * @returns a Function which takes in context and returns the properties value
 */
export function parseProperty(val: any, injectedContext: Context): Function {
  switch (typeof val) {
    case ("string"):
      // when a string, we check to see if it is a computed property and then parse it when true (do nothing when not)
      if (isComputedProp(val)) {
        val = parseComputedProp(val)
      }
      break;

    case ("object"):
      // when an object we sort them into arrays and other objects
      if (isArray(val)) {
        // for an array we parse each of the elements in the array
        const newArray = []
        for (const ele of val) {
          newArray.push(parseProperty(ele, injectedContext))
        }
        // then call a function which groups all the individual functions under one function call
        return arrayOfFunctions(newArray, injectedContext)
      }
      else {
        // for objects we parse each of the properties
        const newVal: any = {}
        for (const prop in val) {
          newVal[prop] = parseProperty(val[prop], injectedContext)
        }

        // then call a function which groups all the individual functions under one function call
        return objectOfFunctions(newVal, injectedContext)
      }

  }

  return (context: Context) =>
    // eslint-disable-next-line no-new-func
    Function("context", `return ${val}`)
      ({ ...injectedContext, ...context }) // This combines the two contexts and overridees the injectedContext if duplicate properties
}

/**
 * Parses a computed property into JavaScript code stored in a String.
 * @param val the computed property to be parsed.
 * @returns a string which can be executed as JavaScript
 */


export function parseComputedProp(val: string): string {
  // regex code
  const bracketsReg = /{{(.*?)}}/g;
  const contextStr = "context";

  const charReg = "[a-zA-Z_0-9]+"

  const dotAccReg = `(\\.${charReg})`
  const brackStrReg = `(\\['${charReg}'\\])`
  const brackVarReg = `(\\[${charReg}\\])`
  const brackDollarReg = `(\\[\`(\\\${${charReg}})+\`\\])`
  const remainReg = "(" + dotAccReg + "|" + brackStrReg + "|" + brackVarReg + "|" + brackDollarReg + ")*"


  const dollarReg = /\${[a-zA-Z_][a-zA-Z_0-9]*}/g
  const actualReg = new RegExp(charReg + remainReg, "g")

  let isPotNumProp = potRawCompProp(val);

  /**
   * Parses an individual variable section
   * @param str the string that was matched
   * @returns the parsed variable section
   */
  function parseVariable(str: string) {
    const firstVarReg = /^[a-zA-Z_][a-zA-Z_0-9]*/

    // this section of code will replace all the bracketed variable sections first (for example [x] with [context[x]]), then will replace all the dot accessors (for example .x with [x]), then will replace all the dollar symbols (for example ${x} with ${context[x]}) and then replace the first variable (for example parent with context[parent])
    return str.replace(new RegExp(brackVarReg, "g"), replaceBrackVar)
      .replace(new RegExp(dotAccReg, "g"), replaceDotAcc)
      .replace(dollarReg, dollarReplace)
      .replace(firstVarReg, replaceFirstVar)
  }

  /**
   * Replaces the first variable if the str is not "context"
   * @param str the string to replace
   * @returns the replacement string
   */
  function replaceFirstVar(str: string) {
    return str === contextStr ? contextStr : "context['" + str + "']"
  }

  /**
   * Replaces the dot accessors
   * @param str the string to replace
   * @returns the replacement string
   */
  function replaceDotAcc(str: string) {
    return "['" + str.slice(1) + "']"
  }

  /**
   * Replaces bracketed variables
   * @param str the string to replace
   * @returns the replacement string
   */
  function replaceBrackVar(str: string) {
    return "[context['" + str.slice(1, -1) + "']]"
  }

  /**
   * Replaces dollar variables
   * @param str the string to replace
   * @returns the replacement string
   */
  function dollarReplace(str: string) {
    return "${context['" + str.slice(2, -1) + "']}"
  }

  /**
   * Parses double bracketed sections ({{...}})
   * @param str 
   * @param p1 
   * @returns 
   */
  function parseBrackets(str: string, p1: string) {
    return isPotNumProp ? p1.replace(actualReg, parseVariable)
      : "${" + p1.replace(actualReg, parseVariable) + "}"
  }


  val = val.replace(bracketsReg, parseBrackets);

  // if it isnt a number (thus a string) then additional quotations are added
  if (!isPotNumProp) {
    val = `\`${val}\``
  }

  return val
}


/**
 * Checks to see is a property is a computed property.
 * @param val the value of the property to be parsed
 * @returns True if the computed property includes "{{}}", False otherwise
 */
export function isComputedProp(val: any): boolean {
  if (val && typeof val !== "function") {
    if (typeof val !== "string") {
      val = JSON.stringify(val);
    }
    let re = /{{(.*?)}}/g;
    const arr = [...val.matchAll(re)];
    return arr.length !== 0;
  }
  return false;
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
  return (arr.length === 1) && (arr[0][0] === arr[0].input);
}
