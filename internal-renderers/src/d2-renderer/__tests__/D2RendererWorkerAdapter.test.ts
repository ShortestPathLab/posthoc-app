import { D2RendererWorkerAdapter } from "d2-renderer/D2RendererWorkerAdapter";
import { describe, expect, it } from "vitest";

describe("D2RendererWorkerAdapter", () => {
  it("instantiates", () => {
    expect(() => new D2RendererWorkerAdapter()).not.toThrow();
  });
});
