import {
  D2RendererOptions,
  defaultD2RendererOptions,
} from "d2-renderer/D2RendererOptions";
import { D2RendererWorker } from "d2-renderer/D2RendererWorker";
import { describe, expect, it, vi } from "vitest";

function makeWorker(options?: Partial<D2RendererOptions>) {
  const worker = new D2RendererWorker();
  worker.setup({
    ...defaultD2RendererOptions,
    workerCount: 1,
    workerIndex: 0,
    ...options,
  });
  return worker;
}

describe("D2RendererWorker", () => {
  it("initializes", () => {
    expect(makeWorker).not.toThrow();
  });

  describe("setFrustum", () => {
    it("initialises", async () => {
      const worker = makeWorker();
      const f = vi.fn(console.log);
      worker.on("message", f);
      worker.setFrustum({
        top: 0,
        left: 0,
        bottom: 256,
        right: 256,
      });
    });
    it("zooms in and out", async () => {
      const worker = makeWorker();
      const f = vi.fn(console.log);
      worker.on("message", f);
      worker.setFrustum({
        top: 0,
        left: 0,
        bottom: 128,
        right: 128,
      });
      await new Promise(process.nextTick);
      expect(f).toBeCalledTimes(4);
      worker.setFrustum({
        top: 0,
        left: 0,
        bottom: 512,
        right: 512,
      });
      await new Promise(process.nextTick);
      expect(f).toBeCalledTimes(4 + 4);
    });
  });

  describe("shouldRender", () => {
    it("correctly determines whether or not to render", async () => {
      const worker = makeWorker({
        workerIndex: 1,
        workerCount: 4,
      });
      const f = vi.fn(console.log);
      worker.on("message", f);
      worker.render();
      await new Promise(process.nextTick);
      expect(f).toBeCalledTimes(1);
    });
  });

  describe("add", () => {
    it("adds component correctly", async () => {
      const worker = makeWorker();
      const f = vi.fn(console.log);
      worker.on("message", f);
      const { world } = worker.getView();
      worker.add(
        [
          {
            $: "rect",
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            alpha: 1,
            fill: "#000000",
            fontSize: 1,
            text: "",
          },
        ],
        "test"
      );
      await new Promise(process.nextTick);
      expect(f).toBeCalledTimes(4);
      expect(world.length).toEqual(1);
    });
  });
  describe("add", () => {
    it("adds component correctly", async () => {
      const worker = makeWorker();
      const f = vi.fn(console.log);
      worker.on("message", f);
      const { world } = worker.getView();
      worker.add(
        [
          {
            $: "rect",
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            alpha: 1,
            fill: "#000000",
            fontSize: 1,
            text: "",
          },
        ],
        "test"
      );
      worker.remove("test");
      await new Promise(process.nextTick);
      expect(f).toBeCalledTimes(4 + 4);
      expect(world.children.length).toEqual(0);
    });
  });
});
