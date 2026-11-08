export const DIRECTIONS = Object.freeze({
  left: { x: -1, y: 0, angle: Math.PI },
  right: { x: 1, y: 0, angle: 0 },
  up: { x: 0, y: -1, angle: -Math.PI / 2 },
  down: { x: 0, y: 1, angle: Math.PI / 2 },
  none: { x: 0, y: 0, angle: 0 },
});

export const REVERSE_DIRECTION = Object.freeze({
  left: "right",
  right: "left",
  up: "down",
  down: "up",
});
