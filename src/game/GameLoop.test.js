import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { GameLoop } from "./GameLoop.js";

describe("GameLoop", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("pauses without scheduling another animation frame", () => {
    let frameCallback;
    const requestAnimationFrame = jest.fn((callback) => {
      frameCallback = callback;
      return 12;
    });
    globalThis.requestAnimationFrame = requestAnimationFrame;
    globalThis.cancelAnimationFrame = jest.fn();
    globalThis.performance = { now: () => 1000 };

    const loop = new GameLoop(() => loop.pause());
    loop.start();
    frameCallback(1030);

    expect(loop.running).toBe(false);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it("stops and cancels the current frame", () => {
    globalThis.requestAnimationFrame = jest.fn(() => 42);
    globalThis.cancelAnimationFrame = jest.fn();
    globalThis.performance = { now: () => 1000 };

    const loop = new GameLoop(() => {});
    loop.start();
    loop.stop();

    expect(loop.running).toBe(false);
    expect(loop.animationFrame).toBe(null);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
  });
});
