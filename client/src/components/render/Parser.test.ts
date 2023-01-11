import { height, letterSpacing } from "@material-ui/system";
import { parseComps, isComputedProp, potRawCompProp, parseComputedProp, parseView } from "./Parser";

/**
 * {{}} (double bracers) means everything inside will be executed as JavaScript in context with variables refering to the properties in the current component
 * 
 * {{context[`${x}${y}`]}} => context[context[x]]
 * 
 * [[]] (double brackets) means everything inside will be executed as JavaScript (same as {{}}) but will then be used to access properties from the current context (this includes properties like current event)
 * 
 * 
 * [[x]] => context[context[x]]
 * For Example,
 * "[[`${x}${y}`]]" where x = 1 and y = 2
 * would become
 * context["12"]
 * 
   {{[[`${x}${y}`]] + 1}} => context[`${x}${y}`] + 1
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
  expect(isComputedProp("{{x}}")).toBe(true);
});

test('isComputedProperty TC2', () => {
  expect(isComputedProp("Test {{`${x}`}}")).toBe(true);
});

test('isComputedProperty TC3', () => {
  expect(isComputedProp("Test")).toBe(false);
});

test('isComputedProperty TC4', () => {
  expect(isComputedProp("{{`${x}`}")).toBe(false);
});

test('isComputedProperty TC5', () => {
  expect(isComputedProp("{`${x}`}}")).toBe(false);
});

test('isComputedProperty TC6', () => {
  expect(isComputedProp("{`${x}`}")).toBe(false);
});

test('isComputedProperty TC7', () => {
  expect(isComputedProp(1)).toBe(false);
});

test('isComputedProperty TC8', () => {
  expect(isComputedProp("[[x]]")).toBe(true);
});

test('isComputedProperty TC9', () => {
  expect(isComputedProp("[[x]")).toBe(false);
});

test('isComputedProperty TC10', () => {
  expect(isComputedProp("[x]")).toBe(false);
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

test('potRawCompProp TC1', () => {
  expect(potRawCompProp("{{x}}")).toBe(true);
});

test('potRawCompProp TC2', () => {
  expect(potRawCompProp("{{`${x}`}}")).toBe(true);
});

test('potRawCompProp TC3', () => {
  expect(potRawCompProp("{{x+y}}")).toBe(true);
});

test('potRawCompProp TC4', () => {
  expect(potRawCompProp("{{x}}+{{y}}")).toBe(false);
});

test('potRawCompProp TC5', () => {
  expect(potRawCompProp("{{x}}+{{y}}")).toBe(false);
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
  expect(parseComputedProp("{{x}}", {})({ "x": 1, "y": 2 })).toBe(1);
});

test('parseCompProp TC2', () => {
  expect(parseComputedProp("{{x}} + {{y}}", {})({ "x": 1, "y": 2 })).toBe("1 + 2");
});

test('parseCompProp TC3', () => {
  expect(parseComputedProp("{{x}} {{y}}", {})({ "x": 1, "y": 2 })).toBe("1 2");
});

test('parseCompProp TC4', () => {
  expect(parseComputedProp("{{`${x}`}}", {})({ "x": 1, "y": 2 })).toBe("1");
});

test('parseCompProp TC5', () => {
  expect(parseComputedProp("{{`${x} ${y}`}}", {})({ "x": 1, "y": 2 })).toBe("1 2");
});

test('parseCompProp TC6', () => {
  expect(parseComputedProp("{{x + y}}", {})({ "x": 1, "y": 2 })).toBe(3);
});

test('parseCompProp TC7', () => {
  expect(parseComputedProp("[[x]]", {})({ "x": "y", "y": 2 })).toBe(2);
});

test('parseCompProp TC8', () => {
  expect(parseComputedProp("[[`${x}${y}`]]", {})({ "x": 2, "y": 2, "22": 1 })).toBe(1);
});

test('parseCompProp TC9', () => {
  expect(parseComputedProp("Test {{x}}", {})({ "x": 1, "y": 2 })).toBe("Test 1");
});

test('parseCompProp TC10', () => {
  expect(parseComputedProp("Test {{x}}", { "x": 5 })({})).toBe("Test 5");
});

test('parseCompProp TC11', () => {
  expect(parseComputedProp("Test {{x}}", { "x": 5 })({ "x": 1 })).toBe("Test 1");
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

// test('parseComp TC3', () => {
//   expect(parseComps([
//           {
//             "$": "tilerow",
//             "y": 1
//           },
//           {
//             "$": "tilerow",
//             "y": 2
//           },
//           {
//             "$": "tilerow",
//             "y": 3
//           }
//         ]
//   , {})).toBe()
// });

/**
 * Tests for parseView function
 * 
 * 
 */

test("parseView TC1", () => {
  const views = parseView({
    "components": {
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
      "tileboard":[
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
    },
    "views": {
      "tiles": [{ "$":"tileboard" }],
      "main": [{ "$": "tree" }]
    }
  });
  const arr = [];
  for (const comp of views.tiles) {
    expect(comp["$"]).toBe("rect");
    expect(comp.height).toBe(1);
    expect(comp.width).toBe(1);
    arr.push(comp.text({}));
  }
  expect(arr).toEqual(
    expect.arrayContaining(["11", "12", "13", "21", "22", "23", "31", "32", "33"])
  );
})