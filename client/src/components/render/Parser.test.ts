import { parseComps, isCompProp, potNumCompProp, parseCompProp } from "./Parser";

/**
 * {{}} (double bracers) means everything inside will be executed as JavaScript in context with variables refering to the properties in the current component
 * 
 * [[]] (double brackets) means everything inside will be executed as JavaScript (same as {{}}) but will then be used to access properties from the current context (this includes properties like current event)
 * 
 * For Example,
 * "[[`${x}${y}`]]" where x = 1 and y = 2
 * would become
 * context["12"]
 * 

 * "{{x}}"" means that it will be of whatever type x is (number, string, etc)
 * "{{`${x}`}}" means it will be a string

 */


/**
 * Tests for isCompProp function
 * TC1: "{{x}}", return True
 * TC2: "Test {{`${x}`}}", return True
 * TC3: "Test", return False
 * TC4: "{{`${x}`}", return False
 * TC5: "{`${x}`}}", return False
 * TC6: "{`${x}`}", return False
 * TC7: 1, return False
 * TC8: "[[x]]", return True
 * TC9: "[[x]", return False
 * TC9: "[x]", return False
 */

test('isComputedProperty TC1', () => {
  expect(isCompProp("{{x}}")).toBe(true);
});

test('isComputedProperty TC2', () => {
  expect(isCompProp("Test {{`${x}`}}")).toBe(true);
});

test('isComputedProperty TC3', () => {
  expect(isCompProp("Test")).toBe(false);
});

test('isComputedProperty TC4', () => {
  expect(isCompProp("{{`${x}`}")).toBe(false);
});

test('isComputedProperty TC5', () => {
  expect(isCompProp("{`${x}`}}")).toBe(false);
});

test('isComputedProperty TC6', () => {
  expect(isCompProp("{`${x}`}")).toBe(false);
});

test('isComputedProperty TC7', () => {
  expect(isCompProp(1)).toBe(false);
});

test('isComputedProperty TC8', () => {
  expect(isCompProp("[[x]]")).toBe(true);
});

test('isComputedProperty TC9', () => {
  expect(isCompProp("[[x]")).toBe(false);
});

test('isComputedProperty TC10', () => {
  expect(isCompProp("[x]")).toBe(false);
});
/**
 * Tests for potNumCompProp function
 * 
 * TC1: "{{x}}", return True
 * TC2: "{{`${x}`}}", return True
 * TC3: "{{x+y}}", return True
 * TC4: "{{x}}+{{y}}", return False
 * TC5: "{{x}}+{{y}}", return False
 * TC6: "{{`${x}${y}`}}", return True
 */

test('potNumCompProp TC1', () => {
  expect(potNumCompProp("{{x}}")).toBe(true);
});

test('potNumCompProp TC2', () => {
  expect(potNumCompProp("{{`${x}`}}")).toBe(true);
});

test('potNumCompProp TC3', () => {
  expect(potNumCompProp("{{x+y}}")).toBe(true);
});

test('potNumCompProp TC4', () => {
  expect(potNumCompProp("{{x}}+{{y}}")).toBe(false);
});

test('potNumCompProp TC5', () => {
  expect(potNumCompProp("{{x}}+{{y}}")).toBe(false);
});




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
 * TC9: "Test {{y}}", return (context) => `Test ${context["y"]}`
 */

test('parseCompProp TC1', () => {
  expect(parseCompProp("{{x}}", {})({ "x": 1, "y": 2 })).toBe(1);
});

test('parseCompProp TC2', () => {
  expect(parseCompProp("{{x}} + {{y}}", {})({ "x": 1, "y": 2 })).toBe("1 + 2");
});

test('parseCompProp TC3', () => {
  expect(parseCompProp("{{x}} {{y}}", {})({ "x": 1, "y": 2 })).toBe("1 2");
});

test('parseCompProp TC4', () => {
  expect(parseCompProp("{{`${x}`}}", {})({ "x": 1, "y": 2 })).toBe("1");
});

test('parseCompProp TC5', () => {
  expect(parseCompProp("{{`${x} ${y}`}}", {})({ "x": 1, "y": 2 })).toBe("1 2");
});

test('parseCompProp TC6', () => {
  expect(parseCompProp("{{x + y}}", {})({ "x": 1, "y": 2 })).toBe(3);
});

test('parseCompProp TC7', () => {
  expect(parseCompProp("[[x]]", {})({ "x": "y", "y": 2 })).toBe(2);
});

test('parseCompProp TC8', () => {
  expect(parseCompProp("[[`${x}${y}`]]", {})({ "x": 2, "y": 2, "22": 1 })).toBe(1);
});

test('parseCompProp TC9', () => {
  expect(parseCompProp("Test {{x}}", {})({ "x": 1, "y": 2 })).toBe("Test 1");
});

test('parseCompProp TC10', () => {
  expect(parseCompProp("Test {{x}}", { "x": 5 })({})).toBe("Test 5");
});

test('parseCompProp TC11', () => {
  expect(parseCompProp("Test {{x}}", { "x": 5 })({ "x": 1 })).toBe("Test 1");
});

/**
 * Tests for parseComp function
 * 
 * TC1: 
 *  "tile": [
 *    {
 *      "$": "rect",
 *      "width": 1,
 *      "height": 1,
 *      "text": "[[`${x}${y}`]]"
 *    }
 *  ]
 * returns 
 *  [ 
 *    {        
 *      "$": "rect",
 *      "width": 1,
 *      "height": 1,
 *      "text": (context) => context[`${x}${y}`]
 *    }
 *  ]
 * 
 * 
 * NOTE tilerow and tile are also provided but left out for readability
 * TC2:
 *  "tileboard":[
 *      {
 *        "$": "tilerow",
 *        "y": 1
 *      },
 *      {
 *        "$": "tilerow",
 *        "y": 2
 *      },
 *      {
 *        "$": "tilerow",
 *        "y": 3
 *      }
 *    ]
 * returns 
 *  [ 
 *    {        
 *      "$": "rect",
 *      "width": 1,
 *      "height": 1,
 *      "text": (context) => context[`11`],
 *      "x": 1,
 *      "y": 1,
 *    },
 *    {        
 *      "$": "rect",
 *      "width": 1,
 *      "height": 1,
 *      "text": (context) => context[`21`],
 *      "x": 2,
 *      "y": 1,
 *    }, 
 *    ... 
 *    {        
 *      "$": "rect",
 *      "width": 1,
 *      "height": 1,
 *      "text": (context) => `context[`33`],
 *      "x": 3
 *      "y": 3,
 *    }
 *  ]
 *
 */

test('parseComp TC1', () => {
  expect(parseComps([
      {
        "$": "rect",
        "width": 1,
        "height": 1,
        "text": "[[`${x}${y}`]]"
      }
    ]
  , {})[0]["text"]({"x":1, "y":2, "12":3})).toBe(3)
})

test('parseComp TC2', () => {
  expect(parseComps([
          {
            "$": "tilerow",
            "y": 1
          }
        ]
  , {}).map((ele)=>ele["text"]({}))).toStrictEqual(["11", "21", "31"])
})

test('parseComp TC3', () => {
  expect(parseComps([
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
  , {}).map((ele)=>ele["text"]({}))).toStrictEqual(["11", "21", "31", "12", "22", "32", "13", "23", "33"])
})

/**
 * Tests for compToDraw function
 * 
 * 
 * TC1: {        
 *      "$": "rect",
 *      "width": 1,
 *      "height": 1,
 *      "text": (context) => `${context.x}${context.y}`,
 *      "x": 1,
 *      "y": 1,
 *  }
 * 
 * returns
 * 
 * TODO
 * 
 * Similar to this
 * const drawRect = (g:GraphicsType, data: any) => {
 *   g
 *     .drawRect(
 *       data.x, data.y, data.width??1, data.height??1
 *     )
 * }
 * 
 */

/**
 * Tests for parseView function
 * 
 * 
 */