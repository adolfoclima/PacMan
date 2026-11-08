import { afterEach, describe, expect, it, vi } from "vitest";
import { GameLoop } from "./GameLoop.js";

describe("GameLoop", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("pauses without scheduling another animation frame", () => {
    let frameCallback;
    const requestAnimationFrame = vi.fn((callback) => {
      frameCallback = callback;
      return 12;
    });
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("performance", { now: () => 1000 });

    const loop = new GameLoop(() => loop.pause());
    loop.start();
    frameCallback(1030);

    expect(loop.running).toBe(false);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it("stops and cancels the current frame", () => {
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 42),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("performance", { now: () => 1000 });

    const loop = new GameLoop(() => {});
    loop.start();
    loop.stop();

    expect(loop.running).toBe(false);
    expect(loop.animationFrame).toBe(null);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
  });
});
