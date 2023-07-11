import { expect, test } from "vitest";
import { expand, optimizeGridMap } from "./grid";

const _ = false;
const T = true;

const input = [
  [_, T, T, T, _],
  [_, T, T, T, _],
  [_, _, T, T, T],
];

test("expand", () => {
  {
    const result = expand(input, T, { x: 2, y: 2 }, { x: 4, y: 2 });
    expect(result).toEqual({
      x: 2,
      y: 2,
    });
  }
  {
    const result = expand(input, _, { x: 0, y: 1 }, { x: 4, y: 2 });
    expect(result).toEqual({
      x: 0,
      y: 1,
    });
  }
  {
    const result = expand(input, _, { x: 0, y: 2 }, { x: 4, y: 2 });
    expect(result).toEqual({
      x: 0,
      y: 2,
    });
  }
  {
    const result = expand(input, _, { x: 0, y: 0 }, { x: 4, y: 2 });
    expect(result).toEqual({
      x: 0,
      y: 0,
    });
  }
  {
    const result = expand(input, T, { x: 1, y: 0 }, { x: 4, y: 2 });
    expect(result).toEqual({
      x: 2,
      y: 1,
    });
  }
  {
    const result = expand(input, T, { x: 1, y: 1 }, { x: 4, y: 2 });
    expect(result).toEqual({
      x: 1,
      y: 1,
    });
  }
});

test("optimizeGridMap", () => {
  const result = optimizeGridMap(input, { width: 5, height: 3 });
  expect(result).toContainEqual([
    {
      height: 2,
      width: 2,
      x: 2,
      y: 1,
    },
    {
      height: 1,
      width: 1,
      x: 2,
      y: 2,
    },
    {
      height: 1,
      width: 1,
      x: 3,
      y: 0,
    },
    {
      height: 1,
      width: 1,
      x: 3,
      y: 1,
    },
    {
      height: 1,
      width: 1,
      x: 3,
      y: 2,
    },
    {
      height: 1,
      width: 1,
      x: 3,
      y: 3,
    },
  ]);
});
